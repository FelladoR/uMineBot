import mongoose from 'mongoose';

// Створення схеми для користувача
const guildSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    whitelist: {
        type: [String],
        default: [],
    },
    logchannel: {
        type: String,
        default: null,
    }
    
}, { collection: 'collguilds' });  // Вказуємо колекцію вручну

const Guild = mongoose.model('Guild', guildSchema);

export default Guild

