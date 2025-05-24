// utils/mailService.ts
import nodemailer from 'nodemailer';

export const sendInvitationEmail = async (
    recipientEmail: string,
    sharedLink: string
) => {
    const frontendJoinUrl = `http:localhost:5173/join-league/${sharedLink}`;

    // Configuration du transporteur mail avec Gmail SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Contenu de l’email
    const mailOptions = {
        from: '"P10 APP" <no-reply@p10-app.com>',
        to: recipientEmail,
        subject: 'Invitation à rejoindre une league',
        html: `
            <h3>Vous avez été invité à rejoindre une league !</h3>
            <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
            <a href="${frontendJoinUrl}">${frontendJoinUrl}</a>
            <br />
            <p>Ce lien est personnel et ne doit pas être partagé.</p>
        `,
    };

    // Envoi du mail
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation envoyée à ${recipientEmail}`);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'invitation :", error);
        throw new Error("Impossible d'envoyer l'invitation.");
    }
};
