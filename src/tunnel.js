import { spawn, execFileSync } from 'node:child_process';

/**
 * 内网穿透封装：为本地 MCP HTTP 服务生成一个公网可访问的 URL。
 *
 * 支持的隧道：
 *   - cloudflared  （免费、免注册，trycloudflare.com 快速隧道；最推荐）
 *   - ngrok        （需 NGROK_AUTHTOKEN）
 *   - localtunnel  （npx 临时拉取，免费）
 *   - cpolar       （国内服务，需注册）
 *
 * 用法：
 *   startTunnel({ port: 3000, type: 'auto' })
 *     → Promise<{ type, url, proc }>，解析出公网 URL 即 resolve；进程持续运行，
 *       日志转发到 stderr，进程退出时自动清理。
 */

const TUNNEL_DEFS = {
  cloudflared: {
    bin: 'cloudflared',
    args: (port) => ['tunnel', '--url', `http://127.0.0.1:${port}`, '--no-autoupdate'],
    urlPattern: /https:\/\/[a-z0-9-]+\.trycloudflare\.com/,
  },
  ngrok: {
    bin: 'ngrok',
    args: (port) => ['http', String(port)],
    urlPattern: /https:\/\/[a-z0-9-]+\.ngrok(?:-free)?\.app/,
  },
  localtunnel: {
    bin: 'npx',
    args: (port) => ['--yes', 'localtunnel', '--port', String(port)],
    urlPattern: /https:\/\/[a-z0-9-]+\.loca\.lt/,
  },
  cpolar: {
    bin: 'cpolar',
    args: (port) => ['http', String(port)],
    urlPattern: /https:\/\/[a-z0-9-]+\.cpolar\.(?:cn|top)/,
  },
};

const ORDER = ['cloudflared', 'ngrok', 'localtunnel', 'cpolar'];
const RESOLVE_TIMEOUT_MS = 45_000;

/** Windows 下 spawn 需要 .cmd 后缀的命令 */
function spawnName(bin) {
  return process.platform === 'win32' && bin === 'npx' ? 'npx.cmd' : bin;
}

/** 检测 PATH 中是否存在某个可执行文件（Windows 用 where，其余用 which）。 */
function hasBin(bin) {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [bin], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

/** 当前平台可用的隧道类型列表（按推荐顺序）。 */
export function availableTunnels() {
  return ORDER.filter((t) => hasBin(TUNNEL_DEFS[t].bin));
}

/**
 * 启动内网穿透隧道。
 * @param {object} opts
 * @param {number} opts.port 本地服务端口
 * @param {string} [opts.type='auto'] auto=自动选择可用隧道；或指定 cloudflared/ngrok/localtunnel/cpolar
 * @returns {Promise<{ type: string, url: string, proc: import('node:child_process').ChildProcess }>}
 * @throws 无可用隧道二进制时抛错，并给出安装指引
 */
export function startTunnel({ port, type = 'auto' }) {
  return new Promise((resolve, reject) => {
    let chosen;
    if (type && type !== 'auto') {
      if (!TUNNEL_DEFS[type]) {
        reject(new Error(`未知隧道类型: ${type}。可选: ${ORDER.join(', ')}`));
        return;
      }
      if (!hasBin(TUNNEL_DEFS[type].bin)) {
        reject(new Error(`未找到 ${TUNNEL_DEFS[type].bin}，请先安装：${installHint(type)}`));
        return;
      }
      chosen = type;
    } else {
      const usable = availableTunnels();
      if (!usable.length) {
        reject(new Error(
          `未检测到任何内网穿透工具。请任选其一安装：\n` +
          `  - cloudflared（推荐，免费免注册）: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/\n` +
          `  - ngrok: https://ngrok.com/download\n` +
          `  - localtunnel: npm i -g localtunnel\n` +
          `  - cpolar: https://www.cpolar.com/\n` +
          `安装后重新运行 npm run tunnel 即可。`
        ));
        return;
      }
      chosen = usable[0];
    }

    const def = TUNNEL_DEFS[chosen];

    // Windows 上 .cmd/.bat 命令必须经 cmd.exe 包装，否则 spawn 报 EINVAL
    let spawnCmd = spawnName(def.bin);
    let spawnArgs = def.args(port);
    if (process.platform === 'win32' && spawnCmd.toLowerCase().endsWith('.cmd')) {
      // .cmd 批处理必须经 cmd.exe /c 包装，否则 Node spawn 报 EINVAL
      spawnCmd = 'cmd.exe';
      const quoted = [def.bin, ...spawnArgs].map(quoteForCmd).join(' ');
      spawnArgs = ['/d', '/s', '/c', quoted];
    }

    const proc = spawn(spawnCmd, spawnArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let settled = false;
    let url = null;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        proc.kill();
        reject(new Error(`${chosen} 隧道 ${RESOLVE_TIMEOUT_MS / 1000} 秒内未获取到公网地址（可能是网络不通或服务未就绪）`));
      }
    }, RESOLVE_TIMEOUT_MS);

    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) {
        try { proc.kill(); } catch { /* 已退出 */ }
        reject(err);
      } else {
        resolve({ type: chosen, url, proc });
      }
    };

    proc.stdout.on('data', (chunk) => onTunnelOutput(chosen, chunk, def, (u) => { url = u; finish(null); }));
    proc.stderr.on('data', (chunk) => onTunnelOutput(chosen, chunk, def, (u) => { url = u; finish(null); }));
    proc.on('error', (e) => finish(new Error(`${chosen} 启动失败: ${e.message}`)));
    proc.on('exit', (code) => {
      if (!settled) finish(new Error(`${chosen} 隧道进程退出（code=${code}）`));
      else process.stderr.write(`[tunnel:${chosen}] 隧道进程已退出（code=${code}）\n`);
    });
  });
}

function onTunnelOutput(chosen, chunk, def, onUrl) {
  const text = chunk.toString();
  process.stderr.write(`[tunnel:${chosen}] ${text.trimEnd()}\n`);
  if (!onUrl) return;
  const m = text.match(def.urlPattern);
  if (m) onUrl(m[0]);
}

function installHint(type) {
  const hints = {
    cloudflared: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/',
    ngrok: 'https://ngrok.com/download',
    localtunnel: 'npm i -g localtunnel',
    cpolar: 'https://www.cpolar.com/',
  };
  return hints[type] || '详见官网';
}

/** 为 cmd.exe /c 拼命令做基础引号包装（端口等简单参数无需引号，防御性处理）。 */
function quoteForCmd(s) {
  if (/^[a-zA-Z0-9_\-./:=]+$/.test(s)) return s;
  return '"' + s.replace(/"/g, '\\"') + '"';
}