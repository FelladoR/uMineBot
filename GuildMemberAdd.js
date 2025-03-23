import { Events, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import 'dotenv/config';
import Logger from './utils/logs.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const lg = new Logger('Bot');

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(interaction) {
        const canvas = createCanvas(500, 200);
        const ctx = canvas.getContext('2d');

        // Завантаження фону
        const background = await loadImage('https://i.imgur.com/6e9i38Z.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Завантаження аватара
        const avatarURL = interaction.user.displayAvatarURL({ extension: 'png', size: 128 });
        const avatar = await loadImage(avatarURL);

        // Малюємо коло під аватар
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(250, 40, 44, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        // Малюємо аватар
        ctx.save();
        ctx.beginPath();
        ctx.arc(250, 40, 40, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 210, 0, 80, 80);
        ctx.restore();

        // Малюємо ім'я користувача
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${interaction.user.username}`, 250, 120);

        // Малюємо текст "Ласкаво просимо!"
        ctx.fillStyle = '#D65AE9';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Ласкаво просимо!', 250, 145);

        // Генеруємо зображення
        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

        // Відправка в канал
        const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID);
        const channel = await guild.channels.fetch('1195317659647086672');

        const embed = new EmbedBuilder()
            .setColor(0x951bf9)
            .setAuthor({ name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg' })
            .setTitle('Ласкаво просимо!')
            .setDescription(`Привіт, ${interaction.user}`);

        await channel.send({ content: `${interaction.user}`, embeds: [embed], files: [attachment] });
    }
};
