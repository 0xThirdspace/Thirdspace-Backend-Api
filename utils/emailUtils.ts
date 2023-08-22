import nodemailer from "nodemailer";

async function sendMail(receiverEmail: string, invitationLink: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "wealthmanagers4@gmail.com", 
        pass: "lacfwmudimhzlmjq", 
      },
    });

    const mailOptions = {
      from: "wealthmanagers4@gmail.com", 
      to: receiverEmail,
      subject: "Workspace Invitation",
      html: `<p>You have been invited to join the workspace. Click <a href="${invitationLink}">here</a> to join.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Invitation email sent successfully.");
  } catch (error) {
    console.error("Error sending invitation email:", error);
  }
}

export { sendMail };
