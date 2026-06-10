import nodemailer from 'nodemailer';
import type { Tip } from '@prisma/client';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function tipHtml(tip: Tip): string {
  const adminUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/admin/pautas`;

  const contactHtml = tip.anonymous
    ? '<p><strong>Remetente:</strong> Anônimo</p>'
    : `
      <p><strong>Remetente:</strong> Identificado</p>
      ${tip.name  ? `<p><strong>Nome:</strong> ${tip.name}</p>`  : ''}
      ${tip.email ? `<p><strong>E-mail:</strong> ${tip.email}</p>` : ''}
      ${tip.phone ? `<p><strong>Telefone:</strong> ${tip.phone}</p>` : ''}
    `;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e3de">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1e;padding:24px 32px">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4)">BNO — Redação</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2">Nova pauta recebida</h1>
          </td>
        </tr>

        <!-- Assunto -->
        <tr>
          <td style="padding:28px 32px 0">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888">Assunto</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#1a1a1e;line-height:1.3">${tip.subject}</p>
          </td>
        </tr>

        <!-- Meta: categoria + localidade -->
        ${(tip.category || tip.location) ? `
        <tr>
          <td style="padding:16px 32px 0">
            <table cellpadding="0" cellspacing="0">
              <tr>
                ${tip.category ? `
                <td style="padding-right:24px">
                  <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888">Categoria</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1a1a1e">${tip.category}</p>
                </td>` : ''}
                ${tip.location ? `
                <td>
                  <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888">Localidade</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1a1a1e">${tip.location}</p>
                </td>` : ''}
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Descrição -->
        <tr>
          <td style="padding:20px 32px 0">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888">Descrição</p>
            <div style="background:#f5f4f0;border-left:3px solid #1a1a1e;padding:14px 16px">
              <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap">${tip.body}</p>
            </div>
          </td>
        </tr>

        <!-- Contato -->
        <tr>
          <td style="padding:20px 32px 0">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888">Contato</p>
            <div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.8">
              ${contactHtml}
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px 32px">
            <a href="${adminUrl}" style="display:inline-block;background:#1a1a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:12px 24px">
              Ver no painel →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #e5e3de;padding:16px 32px">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa">
              Esta mensagem foi gerada automaticamente pelo sistema BNO. Não responda a este e-mail.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendNewTipNotification(tip: Tip): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) return;

  const to = process.env.MAIL_TO;
  if (!to) return;

  await transporter.sendMail({
    from: `"BNO Redação" <${process.env.MAIL_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: `[BNO] Nova pauta: ${tip.subject}`,
    html: tipHtml(tip),
  });
}
