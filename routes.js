import express from 'express';
import { user as userSchema } from './database/schema.js'
import sendEmail from './mailer/email.js'
import bcrypt from "bcrypt";
const router = express.Router();

/*
1. This endpoint is to validate whether email exists or not 
2. If email exists generate reset key and send email
3. If reset key already exists or email is invalid send response accordingly
*/

router.post('/validate/email', async (req, res) => {
    const { email } = req.body;
    const users = await userSchema.findOne({ email: email });
    const isResetKey = users ? users.resetkey : "";

    if (!users) {
        setTimeout(() => {
            res.send("invalid email")
        }, 2000)
    }
    else if (isResetKey) {
        res.send("Reset Link already sent")
    }
    else {
        try {
            const resetKey = await sendEmail(email);
            users.resetkey = resetKey;
            const currentDate = new Date();
            const expiryDate = new Date(currentDate.getTime() + 60 * 60 * 1000);
            users.expiry = expiryDate;
            await users.save();
            res.send("password reset email sent successfully");

        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).send("An error occurred while sending the email.");
        }
    }
});

/*
1. This endpoint is to validate the reset key when users clicks on link from his email
2. If reset key has not expired then allow password reset
3. if reset key is invalid or has expired then send response accordingly
4. if reset key has expired then set key and expiry fields as empty string
*/

router.get('/validate/key', async (req, res) => {

    const resetKey = req.query.resetkey;
    const users = await userSchema.findOne({ resetkey: resetKey });
    if (!users) {
        res.json({ "message": "invalid resetkey" })
    }
    else {
        try {
            const expiryDate = new Date(users.expiry);
            const currentDate = new Date();
            const email = users.email;
            if (currentDate > expiryDate) {
                await userSchema.updateOne({ email: email }, { $unset: { expiry: 1, resetkey: 1 } });
                users.expiry = "";
                users.resetkey = "";
                await users.save();
            }
            const response = {
                "message": (currentDate > expiryDate) ? "link expired" : "link valid",
                "email": email
            }
            if (currentDate > expiryDate) {
                res.json(response)
            }
            else {
                res.json(response)
            }
        }
        catch (error) {
            console.log(error)
            res.status(500).json({ "message": "server error" });
        }
    }
});

/*
1. This endpoint is to update the password
2. Generate a hash of the password using bcrypt and store in database
3.  After updating password remove reset key and expiry fields from the document
*/

router.put('/update', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashPassword = bcrypt.hashSync(password, 10);
        await userSchema.updateOne({ email: email }, { $set: { password: hashPassword }, $unset: { expiry: 1, resetkey: 1 } });
        res.json({ "message": "password updated" });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ "message": "server error" });
    }

})

export default router;