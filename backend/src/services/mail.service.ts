import nodemailer from 'nodemailer';
import {
  getResetPasswordTemplate,
  getWelcomeTemplate,
  getNewJobTemplate,
  getJobModifiedTemplate,
  getJobUnavailableTemplate,
  getSecurityAlertTemplate,
  getSavedJobReminderTemplate,
  getApplicationFeedbackTemplate,
} from '../components/email-templates.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

const sendEmail = async (to: string | string[], subject: string, html: string) => {
  const mailOptions = {
    from: `"Foxx Recruitment" <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(',') : to,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado para ${to}:`, info.messageId);
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${to}:`, error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  const htmlContent = getResetPasswordTemplate(resetLink, to);
  return sendEmail(to, 'Redefinição de Senha - Foxx Recruitment', htmlContent);
};

export const sendWelcomeEmail = async (to: string, userName: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const profileLink = `${baseUrl}/dashboard/profile`;
  const htmlContent = getWelcomeTemplate(userName, profileLink);
  return sendEmail(to, 'Bem-vindo ao Foxx Recruitment!', htmlContent);
};

export const sendNewJobNotification = async (recipients: string[], jobTitle: string, institutionName: string) => {
  if (recipients.length === 0) return;
  const htmlContent = getNewJobTemplate(jobTitle, institutionName);
  const mailOptions = {
    from: `"Foxx Recruitment" <${process.env.GMAIL_USER}>`,
    bcc: recipients,
    subject: `Nova Vaga: ${jobTitle}`,
    html: htmlContent,
  };
  try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Notificação de nova vaga enviada (BCC):', info.messageId);
      return { success: true, id: info.messageId };
  } catch (error) {
      console.error('Erro ao enviar notificação de nova vaga:', error);
      return { success: false, error };
  }
};

export const sendJobModifiedNotification = async (to: string, jobTitle: string) => {
  const htmlContent = getJobModifiedTemplate(jobTitle);
  return sendEmail(to, `Vaga Atualizada: ${jobTitle}`, htmlContent);
};

export const sendJobUnavailableNotification = async (to: string, jobTitle: string) => {
  const htmlContent = getJobUnavailableTemplate(jobTitle);
  return sendEmail(to, `Vaga Encerrada: ${jobTitle}`, htmlContent);
};

export const sendSecurityAlert = async (to: string) => {
  const htmlContent = getSecurityAlertTemplate();
  return sendEmail(to, 'Alerta de Segurança - Senha Alterada', htmlContent);
};

export const sendSavedJobReminder = async (to: string, jobTitle: string) => {
  const htmlContent = getSavedJobReminderTemplate(jobTitle);
  return sendEmail(to, `Lembrete: Vaga ${jobTitle}`, htmlContent);
};

export const sendApplicationFeedback = async (to: string, jobTitle: string) => {
  const htmlContent = getApplicationFeedbackTemplate(jobTitle);
  return sendEmail(to, `Aplicação Recebida: ${jobTitle}`, htmlContent);
};

// NEW METHODS FOR FOXX RECRUITMENT

export const sendTrialLessonSchedule = async (to: string, jobTitle: string, date: Date) => {
    // Simple HTML content directly here or fetch from templates
    const dateStr = date.toLocaleString('pt-BR');
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #0f172a;">Agendamento de Prova Didática</h2>
                <p>Olá,</p>
                <p>Sua prova didática para a vaga <strong>${jobTitle}</strong> foi agendada.</p>
                <p style="font-size: 18px; font-weight: bold; color: #2563eb;">Data: ${dateStr}</p>
                <p>Por favor, esteja preparado.</p>
                <p>Atenciosamente,<br>Equipe Foxx Recruitment</p>
            </div>
        </div>
    `;
    return sendEmail(to, `Agendamento de Prova: ${jobTitle}`, htmlContent);
};

export const sendMagicLink = async (to: string, jobTitle: string, link: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #0f172a;">Parabéns! Você foi Aprovado(a).</h2>
                <p>Olá,</p>
                <p>Você obteve a nota necessária na prova didática para a vaga <strong>${jobTitle}</strong>.</p>
                <p>Agora, precisamos que você envie seus documentos para formalização.</p>
                <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                    Enviar Documentos
                </a>
                <p style="font-size: 12px; color: #666;">Este link expira em 7 dias.</p>
                <p>Atenciosamente,<br>Equipe Foxx Recruitment</p>
            </div>
        </div>
    `;
    return sendEmail(to, `Aprovação e Envio de Documentos: ${jobTitle}`, htmlContent);
};
