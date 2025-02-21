import mongoose from 'mongoose';

const donate_ticketSchema = new mongoose.Schema({
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

const Donate_Ticket = mongoose.model('donate_ticketSchema', donate_ticketSchema);

export default Donate_Ticket;

