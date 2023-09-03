import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    userid: {
        type: Number,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    resetkey: {
        type: String,
        required: false,
    },
    expiry: {
        type: String,
        required: false,
    }
});

const user = mongoose.model('users', emailSchema);

export { user };