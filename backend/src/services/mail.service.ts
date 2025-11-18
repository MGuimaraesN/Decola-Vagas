import nodemailer from 'nodemailer';
import { getResetPasswordTemplate } from '../components/email-templates.js'; // Importa o HTML que criamos antes

// Configura o transportador com o serviço do Gmail
// O Nodemailer já conhece as portas e hosts do Gmail automaticamente
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS, // Use a Senha de App, não a senha normal
  },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  // Gera o HTML bonito usando nossa função pura
  const htmlContent = getResetPasswordTemplate(resetLink, to);

  const mailOptions = {
    from: `"Decola Vagas" <${process.env.GMAIL_USER}>`, // Nome que aparece para o usuário
    to: to,
    subject: 'Redefinição de Senha - Decola Vagas',
    html: htmlContent,
  };

  try {
    // Verifica a conexão antes de enviar (opcional, mas bom para debug)
    await transporter.verify();
    
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado via Gmail:', info.messageId);
    return { success: true, id: info.messageId };

  } catch (error) {
    console.error('Erro ao enviar e-mail via Gmail:', error);
    return { success: false, error };
  }
};