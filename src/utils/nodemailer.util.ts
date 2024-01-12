import { createTransport, getTestMessageUrl } from 'nodemailer';
import { EMAILDATA } from '../utils/costume.type';
import dotenv from 'dotenv';

dotenv.config();

// Create a transport object
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ID || '', // Retrieving from environment variables
    pass: process.env.MAIL_PASS || '', // Retrieving from environment variables
  },
});

// ======================= Send Email =======================
export const sendEmail = async (data: EMAILDATA): Promise<string> => {
  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"Hey <3" <abc@gmail.com>`, // Sender address
      to: data.to, // List of receivers
      subject: data.subject, // Subject line
      text: data.text, // Plain text body
      html: data.html, // HTML body
    });

    return info.response;
  } catch (err: any) {
    throw new Error(`Error sending email: ${err.message}`);
  }
};
