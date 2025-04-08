import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    author_id: {
        type: String,
        required: true,
    },
    player_minecraft_nickname: {
        type: String,
        required: true
    },
    moderator_id: {
        type: String,
        required: false
    },
    donate: {
        type: String,
        required: true
    },
    role_id: {
        type: String,
        required: false
    }
    
}, { collection: 'donate_tickets' });  // Вказуємо колекцію вручну

const SupportTicket = mongoose.model('supportTicketSchema', supportTicketSchema);

export default SupportTicket;

