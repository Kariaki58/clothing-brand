"use server";
import nodemailer from "nodemailer";


export async function sendEmail(email, subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.APP_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}

export async function sendInquire(subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.APP_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: process.env.EMAIL_ADDRESS,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}