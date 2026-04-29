# task-notifier

任务完成通知 OpenClaw Skill — 自动通过邮件将任务成果发送给用户。

## 功能

- **邮件通知**：任务完成时自动发送邮件汇报成果
- **HTML 精美模板**：支持专业邮件格式，含状态徽章、摘要卡片
- **附件支持**：自动附加成果文件，支持多附件
- **多种格式**：支持纯文本和 HTML 两种邮件格式

## 安装

```bash
# 一键安装
skillhub_install install_skill task-notifier
```

或手动克隆到 OpenClaw skills 目录。

## 快速使用

```bash
# 纯文本通知
node scripts/send_notification.cjs \
  --to 收件人@example.com \
  --subject "✅ 任务完成" \
  --body "已完成数据整理，共处理100封邮件"

# HTML 精美邮件
node scripts/send_notification.cjs \
  --to 收件人@example.com \
  --subject "✅ 任务完成" \
  --body "已完成数据整理" \
  --html

# 带附件
node scripts/send_notification.cjs \
  --to 收件人@example.com \
  --subject "📊 数据报告" \
  --body "请查看附件" \
  --attach "report.xlsx" \
  --html
```

## 配置

需要在同目录或 `~/.qclaw/workspace/` 下放置 `163-email.env`：

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=你的邮箱@163.com
SMTP_PASS=你的授权码
```

## 文件结构

```
task-notifier/
├── SKILL.md                      # Skill 描述与使用指南
├── README.md                     # 项目说明
├── .gitignore                    # Git 忽略配置
├── scripts/
│   └── send_notification.cjs    # 通知发送脚本
├── references/                   # 参考文档（待补充）
└── assets/                       # 静态资源（待补充）
```

## License

MIT
