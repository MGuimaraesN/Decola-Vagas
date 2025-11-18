export const getResetPasswordTemplate = (resetLink: string, userEmail: string): string => {
  // Ícone 'Building' do Lucide (Cabeçalho) - Cor alterada para #ffffff
  const buildingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
  
  // Ícone de Cadeado (Corpo) - Sem alterações
  const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

  // --- REFAFORAÇÃO COMPLETA PARA INLINE CSS E TABELAS ---
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Redefinição de Senha</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Estilos de reset básicos para clientes de e-mail */
    body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; margin: 0; padding: 0; }
    img { outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a img { border: none; }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    h1, p { margin: 0; }
  </style>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 0;">
  <!-- Tabela de Fundo (bg-neutral-100) -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Tabela do Card Principal (bg-white) -->
        <table width="560" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e5e7eb; max-width: 560px;">
          
          <!-- Linha do Cabeçalho (bg-neutral-900) - Cor #18181b do seu site -->
          <tr>
            <td style="background-color: #18181b; padding: 32px; text-align: center;">
              <!-- Tabela interna para centralizar ícone e texto -->
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    ${buildingIcon}
                  </td>
                  <td style="font-size: 24px; font-weight: bold; color: #ffffff; vertical-align: middle;">
                    Decola Vagas
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Linha do Conteúdo (bg-white) -->
          <tr>
            <td style="padding: 40px 32px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                
                <!-- Ícone de Cadeado -->
                <tr>
                  <td style="text-align: center; padding-bottom: 24px;">
                    ${lockIcon}
                  </td>
                </tr>
                
                <!-- Título - Alterado para "Redefinir Senha" -->
                <tr>
                  <td style="font-size: 24px; font-weight: 600; text-align: center; padding-bottom: 24px; color: #111827;">
                    Redefinir Senha
                  </td>
                </tr>
                
                <!-- Parágrafo 1 - Tom amigável "Sem problemas!" do site -->
                <tr>
                  <td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">
                    Recebemos uma solicitação para redefinir a senha da conta associada a <strong style="color: #111827;">${userEmail}</strong>.
                  </td>
                </tr>
                
                <!-- Parágrafo 2 - Texto atualizado -->
                <tr>
                  <td style="font-size: 16px; line-height: 26px; color: #4b5563; padding-bottom: 24px;">
                    Se foi você, clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.
                  </td>
                </tr>
                
                <!-- Botão - Cor e texto alterados -->
                <tr>
                  <td style="text-align: center; padding: 12px 0;">
                    <!-- Cor do botão alterada para #18181b para combinar com o site -->
                    <a href="${resetLink}" target="_blank" style="background-color: #18181b; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; display: inline-block;">
                      Criar Nova Senha
                    </a>
                  </td>
                </tr>
                
                <!-- Link Alternativo -->
                <tr>
                  <td style="font-size: 14px; line-height: 24px; color: #6b7280; padding-top: 24px;">
                    Ou copie e cole este link: <br>
                    <a href="${resetLink}" style="color: #2563EB; text-decoration: underline; word-break: break-all;">${resetLink}</a>
                  </td>
                </tr>
                
                <!-- Divisor -->
                <tr>
                  <td style="padding-top: 32px; padding-bottom: 32px;">
                    <hr style="border: 0; border-top: 1px solid #e5e7eb;">
                  </td>
                </tr>
                
                <!-- Rodapé - Adicionado © 2025 Decola Vagas -->
                <tr>
                  <td style="color: #6b7280; font-size: 12px; line-height: 20px; text-align: center;">
                    Se você não solicitou a troca de senha, ignore este e-mail.
                    <br><br>
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