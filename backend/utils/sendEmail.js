const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
        // html: options.message
    };

    await transporter.sendMail(mailOptions); // Corrected method name

    console.log("Email sent successfully!");
};

module.exports = sendEmail;
