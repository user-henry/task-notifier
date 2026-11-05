**English** | [简体中文](README.md)

# task-notifier

A task-completion notification OpenClaw Skill — automatically emails task results to the user.

## Features

- **Email notification**: automatically sends an email reporting the results when a task completes
- **Polished HTML template**: professional email layouts with status badges and summary cards
- **Attachment support**: automatically attaches result files, with multi-attachment support
- **Multiple formats**: supports both plain-text and HTML emails

## Installation

```bash
# One-click installation
skillhub_install install_skill task-notifier
```

Or clone it manually into the OpenClaw skills directory.

## Quick start

```bash
# Plain-text notification
node scripts/send_notification.cjs \
  --to recipient@example.com \
  --subject "✅ Task complete" \
  --body "Data cleanup finished, 100 emails processed"

# Polished HTML email
node scripts/send_notification.cjs \
  --to recipient@example.com \
  --subject "✅ Task complete" \
  --body "Data cleanup finished" \
  --html

# With attachments
node scripts/send_notification.cjs \
  --to recipient@example.com \
  --subject "📊 Data report" \
  --body "Please see the attachments" \
  --attach "report.xlsx" \
  --html
```

## Configuration

Place a `163-email.env` file in the same directory or under `~/.qclaw/workspace/`:

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-authorization-code
```

## File structure

```
task-notifier/
├── SKILL.md                      # Skill description and usage guide
├── README.md                     # Project description
├── .gitignore                    # Git ignore rules
├── scripts/
│   └── send_notification.cjs    # Notification sending script
├── references/                   # Reference documents (to be added)
└── assets/                       # Static assets (to be added)
```

## License

MIT
