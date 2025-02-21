import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import mongoose from 'mongoose';
import Logger from './utils/logs.js'
const lg = new Logger('Bot')

// Визначення __dirname для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoURI = process.env.MONGODB_TOKEN;
if (!mongoURI) {
    lg.error('MONGODB_TOKEN не заданий у .env');
    process.exit(1);
}

mongoose.connect(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
    .then(() => lg.success('Підключено до MongoDB'))
    .catch((err) => lg.error('❌ Помилка підключення до MongoDB:', err));

const token = process.env.TOKEN;
if (!token) {
    lg.error('TOKEN не заданий у .env');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
    ]
});

// Імпорт подій (асинхронний)
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

(async () => {
    for (const file of eventFiles) {
        lg.success(`Івент ${file} завантажується`);
        const filePath = `file://${path.join(eventsPath, file)}`;
        
        const event = await import(filePath);
        if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
        } else {
            client.on(event.default.name, (...args) => event.default.execute(...args));
        }
    }

    client.login(token);
})();
