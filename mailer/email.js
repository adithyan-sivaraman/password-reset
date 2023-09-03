import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const pass = process.env.USER_PWD;
const user = process.env.USER_EMAIL

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: user,
        pass: pass
    }
});




const sendEmail = async (email) => {
    try {
        const resetKey = crypto.randomBytes(32).toString('hex');
        const text = `
            Hello User
            This is an system generated email for password reset
            Please click on link or paste it in browser
            Link = http://localhost:5173/?reset=${resetKey}
            `

        const html = `
            <p><b>Hello User</b></p>
            <p>This is an system generated email for password reset</p>
            <p>Please click on link or paste it in browser</p>
            <a href="http://localhost:5173/?reset=${resetKey}">Reset Link</a>
            `
        const response = await transport.sendMail({
            from: user,
            to: email,
            subject: 'Password reset email',
            text: text,
            html: html,
        });

        console.log(`Sent mail: ${response.messageId}`);
        return resetKey; // Return the key only if the email is sent successfully
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

export default sendEmail;