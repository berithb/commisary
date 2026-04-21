export type ResetPasswordTemplateInput = {
  userName: string;
  resetCode: string;
};

const buildResetPasswordEmail = ({ userName, resetCode }: ResetPasswordTemplateInput): { html: string; text: string } => {
  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#10375c;padding:24px 20px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:24px;line-height:1.2;">Commissary System</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;color:#1f2937;">
              <p style="margin:0 0 16px;font-size:16px;">Hi ${userName},</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Use this verification code to reset your password:</p>
              <p style="margin:0 0 20px;font-size:32px;line-height:1;font-weight:700;letter-spacing:8px;color:#10375c;">${resetCode}</p>
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#4b5563;">This code is valid for 10 minutes.</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b5563;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${userName},\n\nWe received a request to reset your password.\n\nYour verification code is: ${resetCode}\n\nThis code is valid for 10 minutes.\nIf you did not request this, please ignore this email.`;

  return { html, text };
};

export default buildResetPasswordEmail;
