// Header Logo (Building Icon)
const buildingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;

// Base Layout reusable function
const getEmailLayout = (title: string, content: string): string => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; margin: 0; padding: 0; }
    img { outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a img { border: none; }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    h1, p { margin: 0; }
  </style>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 0;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="560" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e5e7eb; max-width: 560px;">
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 32px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">${buildingIcon}</td>
                  <td style="font-size: 24px; font-weight: bold; color: #ffffff; vertical-align: middle;">Decola Vagas</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                ${content}
                <!-- Footer -->
                <tr>
                  <td style="padding-top: 32px; padding-bottom: 32px;">
                    <hr style="border: 0; border-top: 1px solid #e5e7eb;">
                  </td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 12px; line-height: 20px; text-align: center;">
                    &copy; 2025 Decola Vagas
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// --- Templates ---

export const getResetPasswordTemplate = (resetLink: string, userEmail: string): string => {
  const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  const content = `
    <tr><td style="text-align: center; padding-bottom: 24px;">${lockIcon}</td></tr>
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Redefinir Senha</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Recebemos uma solicitação para redefinir a senha da conta associada a <strong style="color: #111827;">${userEmail}</strong>.</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Se foi você, clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</td></tr>
    <tr><td style="text-align: center; padding: 12px 0;"><a href="${resetLink}" target="_blank" style="background-color: #18181b; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; display: inline-block;">Criar Nova Senha</a></td></tr>
    <tr><td style="font-size: 14px; line-height: 24px; color: #6b7280; padding-top: 24px;">Ou copie e cole este link: <br><a href="${resetLink}" style="color: #2563EB; text-decoration: underline; word-break: break-all;">${resetLink}</a></td></tr>
  `;
  return getEmailLayout("Redefinição de Senha", content);
};

export const getWelcomeTemplate = (userName: string): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Bem-vindo(a), ${userName}!</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Estamos muito felizes em ter você conosco no Decola Vagas.</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Complete seu perfil para aproveitar ao máximo a plataforma e encontrar as melhores oportunidades.</td></tr>
  `;
  return getEmailLayout("Bem-vindo ao Decola Vagas", content);
};

export const getNewJobTemplate = (jobTitle: string, institutionName: string): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Nova Vaga Disponível!</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Uma nova oportunidade na sua área foi publicada:</td></tr>
    <tr><td style="font-size: 18px; font-weight: bold; color: #111827; padding-bottom: 8px;">${jobTitle}</td></tr>
    <tr><td style="font-size: 16px; color: #4b5563; padding-bottom: 24px;">em ${institutionName}</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Acesse a plataforma para ver mais detalhes e se candidatar.</td></tr>
  `;
  return getEmailLayout("Nova Vaga no Decola Vagas", content);
};

export const getJobModifiedTemplate = (jobTitle: string): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Vaga Atualizada</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">A vaga <strong>${jobTitle}</strong> que você salvou sofreu alterações importantes.</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Recomendamos que você verifique as novas informações.</td></tr>
  `;
  return getEmailLayout("Atualização de Vaga", content);
};

export const getJobUnavailableTemplate = (jobTitle: string): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Vaga Encerrada</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Informamos que a vaga <strong>${jobTitle}</strong> foi encerrada ou preenchida.</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Continue buscando novas oportunidades em nossa plataforma!</td></tr>
  `;
  return getEmailLayout("Vaga Indisponível", content);
};

export const getSecurityAlertTemplate = (): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Alerta de Segurança</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Sua senha foi alterada recentemente.</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Se não foi você que realizou esta alteração, entre em contato conosco imediatamente.</td></tr>
  `;
  return getEmailLayout("Alerta de Segurança", content);
};

export const getSavedJobReminderTemplate = (jobTitle: string): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Lembrete de Vaga Salva</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Você ainda tem interesse na vaga <strong>${jobTitle}</strong>?</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Ela continua aberta e aguardando sua candidatura!</td></tr>
  `;
  return getEmailLayout("Lembrete de Vaga", content);
};

export const getApplicationFeedbackTemplate = (jobTitle: string): string => {
  const content = `
    <tr><td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">Aplicação Recebida</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Sua aplicação para a vaga <strong>${jobTitle}</strong> foi enviada/recebida com sucesso.</td></tr>
    <tr><td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">Boa sorte!</td></tr>
  `;
  return getEmailLayout("Confirmação de Aplicação", content);
};
