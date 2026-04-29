/**
 * task-notifier/send_notification.cjs
 * 发送任务完成通知邮件（支持附件）
 * 
 * 用法:
 *   node send_notification.cjs --to <收件人> --subject <主题> --body <正文> [--html] [--attach <文件路径>] [--attach <文件路径>...]
 * 
 * 配置文件（按优先级）:
 *   1. --config <路径>  参数指定
 *   2. 工作区 163-email.env
 *   3. 技能目录 163-email.env
 *   4. ~/.qclaw/workspace/163-email.env
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.join(__dirname, '..');
const WORKSPACE_DIR = 'C:\\Users\\黄兴\\.qclaw\\workspace';

function findEnvFile() {
  const candidates = [
    path.join(WORKSPACE_DIR, '163-email.env'),
    path.join(SKILL_DIR, '163-email.env'),
    path.join(SKILL_DIR, '..', 'imap-smtp-email', '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function loadEnv(envPath) {
  const vars = {};
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const idx = t.indexOf('=');
    if (idx > 0) {
      vars[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
  return vars;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { to: null, subject: null, body: null, html: false, attach: [], config: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && i + 1 < args.length) result.to = args[++i];
    else if (args[i] === '--subject' && i + 1 < args.length) result.subject = args[++i];
    else if (args[i] === '--body' && i + 1 < args.length) result.body = args[++i];
    else if (args[i] === '--html') result.html = true;
    else if (args[i] === '--attach' && i + 1 < args.length) result.attach.push(args[++i]);
    else if (args[i] === '--config' && i + 1 < args.length) result.config = args[++i];
  }
  return result;
}

function buildHtmlEmail(opts) {
  const status = opts.status || 'completed';
  const statusColor = { success: '#22c55e', failed: '#ef4444', running: '#f59e0b' }[status] || '#6366f1';
  const statusText = { success: '✅ 任务完成', failed: '❌ 任务失败', running: '🔄 任务进行中' }[status] || '📌 任务通知';
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const attachments = opts.attachments || [];

  let attachmentsHtml = '';
  if (attachments.length > 0) {
    const rows = attachments.map(f => {
      const name = path.basename(f);
      const size = fs.existsSync(f) ? (fs.statSync(f).size / 1024).toFixed(1) + ' KB' : '未知';
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top">📎 <code style="font-size:13px;background:#f3f4f6;padding:2px 6px;border-radius:4px">${name}</code></td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">${size}</td></tr>`;
    }).join('');
    attachmentsHtml = `
      <div style="margin-top:24px">
        <div style="font-weight:600;color:#374151;margin-bottom:10px">📎 附件成果（${attachments.length}个）</div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <thead><tr style="background:#f9fafb"><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">文件名</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">大小</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${opts.subject || '任务通知'}</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px">
      <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-bottom:8px">🤖 OpenClaw 任务助手</div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff">${statusText}</h1>
    </div>
    <!-- Body -->
    <div style="padding:32px 40px">
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:20px">
        <div style="font-size:13px;color:#6b7280;margin-bottom:4px">主题</div>
        <div style="font-size:16px;font-weight:600;color:#111827">${opts.subject || '(无标题)'}</div>
      </div>
      ${opts.summary ? `<div style="margin-bottom:20px">
        <div style="font-size:13px;color:#6b7280;margin-bottom:8px">任务摘要</div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap;max-height:300px;overflow-y:auto">${opts.summary}</div>
      </div>` : ''}
      ${opts.body ? `<div style="margin-bottom:20px">
        <div style="font-size:13px;color:#6b7280;margin-bottom:8px">详情</div>
        <div style="font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap">${opts.body}</div>
      </div>` : ''}
      ${attachmentsHtml}
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center">
        发送时间：${time} · 由 OpenClaw 任务通知助手自动生成
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildPlainEmail(opts) {
  const status = opts.status || 'completed';
  const statusText = { success: '✅ 任务完成', failed: '❌ 任务失败', running: '🔄 任务进行中' }[status] || '📌 任务通知';
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  let text = `${statusText}\n${'='.repeat(40)}\n\n主题：${opts.subject || '(无标题)'}\n时间：${time}\n\n`;
  if (opts.summary) text += `任务摘要：\n${opts.summary}\n\n`;
  if (opts.body) text += `详情：\n${opts.body}\n\n`;
  if (opts.attachments && opts.attachments.length > 0) {
    text += `附件成果（${opts.attachments.length}个）：\n`;
    opts.attachments.forEach(f => {
      const name = path.basename(f);
      const size = fs.existsSync(f) ? (fs.statSync(f).size / 1024).toFixed(1) + ' KB' : '未知';
      text += `  📎 ${name} (${size})\n`;
    });
  }
  return text;
}

async function main() {
  const opts = parseArgs();
  
  if (!opts.subject || !opts.body) {
    console.error('用法: node send_notification.cjs --to <收件人> --subject <主题> --body <正文> [--html] [--attach <文件路径>...] [--config <配置路径>]');
    process.exit(1);
  }

  // 查找配置文件
  const envPath = opts.config || findEnvFile();
  if (!envPath) {
    console.error('错误: 找不到 163-email.env 配置文件。请先配置邮箱。');
    console.error('配置路径: C:\\Users\\黄兴\\.qclaw\\workspace\\163-email.env');
    process.exit(1);
  }

  const env = loadEnv(envPath);
  const from = env['SMTP_USER'] || env['IMAP_USER'];
  const pass = env['SMTP_PASS'] || env['IMAP_PASS'];
  const host = env['SMTP_HOST'] || 'smtp.163.com';
  const port = parseInt(env['SMTP_PORT']) || 465;
  const secure = env['SMTP_SECURE'] === 'true';

  if (!from || !pass) {
    console.error('错误: 配置文件缺少 SMTP_USER 或 SMTP_PASS');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user: from, pass },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  const attachments = opts.attach.map(f => {
    if (!fs.existsSync(f)) {
      console.warn(`警告: 附件不存在: ${f}`);
      return null;
    }
    return { filename: path.basename(f), path: f };
  }).filter(Boolean);

  const mailOptions = {
    from: `"OpenClaw 任务助手" <${from}>`,
    to: opts.to || from,
    subject: opts.subject,
    text: buildPlainEmail(opts),
    html: buildHtmlEmail(opts),
    attachments,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('发送失败:', err.message);
        reject(err);
      } else {
        console.log('发送成功! messageId:', info.messageId);
        if (attachments.length > 0) {
          console.log('附件已发送:', attachments.map(a => a.filename).join(', '));
        }
        resolve(info);
      }
    });
  });
}

main().catch(err => { console.error(err); process.exit(1); });
