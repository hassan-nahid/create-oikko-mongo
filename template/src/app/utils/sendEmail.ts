/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { envVars } from "../config/env";
const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
    secure: Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    },
    tls: {
        // Do not fail on invalid certs (for development)
        rejectUnauthorized: false
    }
})

interface SendEmailOptions {
    to: string,
    subject: string;
    templateName: string;
    templateData?: Record<string, any>
    attachments?: {
        filename: string,
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendEmail = async ({
    to,
    subject,
    templateName,
    templateData,
    attachments
}: SendEmailOptions) => {
    try {
        const templatePath = path.join(process.cwd(), 'src', 'app', 'utils', 'templates', `${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: `"Example" <${envVars.EMAIL_SENDER.SMTP_FROM}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })
        console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
        console.log("email sending error", error.message);
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to send email. Please try again later")
    }

}