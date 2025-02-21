import mongoose from 'mongoose';

// Створення схеми для користувача
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    warns: {
        type: Number,
        default: 0,
    },
    reasons: [{
        author_id: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        proofs: {
            type: String,
            required: true
        }
    }],
}, { collection: 'collusers' });  // Вказуємо колекцію вручну

const User = mongoose.model('User', userSchema);

export default User;