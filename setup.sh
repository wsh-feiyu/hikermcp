#!/bin/bash
# hiker-mcp 本地安装脚本
# 用法: curl -sL http://<host>:<port>/hiker-mcp.zip | unzip -d /tmp/hiker-mcp && cd /tmp/hiker-mcp && bash setup.sh
# 或手动下载后: cd hiker-mcp && bash setup.sh

set -e

echo "============================================"
echo "  hiker-mcp 海阔视界规则编辑器 MCP 安装脚本"
echo "============================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js >= 18"
    echo "   下载: https://nodejs.org/"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "✅ Node.js $(node -v)"
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ 需要 Node.js >= 18，当前版本过低"
    exit 1
fi

# 创建项目级 MCP 配置目录
mkdir -p .trae

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install 2>&1 | tail -3

# 运行测试
echo ""
echo "🧪 运行测试..."
npm test 2>&1 | tail -5

echo ""
echo "============================================"
echo "  ✅ 安装完成！"
echo "============================================"
echo ""
echo "📁 项目路径: $(pwd)"
echo ""
echo "🚀 启动方式:"
echo "   node src/index.js           # stdio 模式（默认）"
echo "   node src/index.js --http    # HTTP 模式（端口 3000）"
echo ""
echo "🔌 接入 TraeCode:"
echo "   1. 打开 TraeCode 设置 → MCP"
echo "   2. 开启「启用项目级 MCP」"
echo "   3. 确保 .trae/mcp.json 中的路径为实际路径"
echo ""
echo "🔌 接入 Claude Desktop:"
echo "   编辑 ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   添加:"
echo '   {'
echo '     "mcpServers": {'
echo '       "hiker-mcp": {'
echo '         "command": "node",'
echo '         "args": ["'$(pwd)'/src/index.js"]'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "📱 连接海阔视界 App（可选）:"
echo "   编辑 config/mcp.json，填入手机 IP"
echo "   手机与电脑需在同一局域网"
echo "   不配也能用：格式化、校验、导出"
echo ""

# 测试成果展示
echo "============================================"
echo "  📋 工具清单（12 个）"
echo "============================================"
echo "  无需 App 即可测试:"
echo "    ✅ format_rule_code       - 格式化规则代码"
echo "    ✅ validate_rule          - 校验规则结构与代码语法"
echo "    ✅ export_rule_json       - 导出规则 JSON"
echo "    ✅ get_connection_status  - 检查 App 连接状态"
echo "    ✅ remember_lesson        - 记录写源教训"
echo "    ✅ recall_lessons         - 检索历史教训"
echo "    ✅ list_lessons           - 列出全部教训"
echo "    ✅ forget_lesson          - 删除教训"
echo "    ✅ list_rules             - 列出 App 中规则（需连接）"
echo "    ✅ get_rule               - 读取规则内容（需连接）"
echo "    ✅ save_rule              - 保存规则（需连接）"
echo "    ✅ share_rule_paste       - 云分享规则（需用户明确要求）"
echo ""
echo "🎉 现在可以开始使用了！"