import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Logger from '../../utils/logs.js';

const lg = new Logger('Bot');

export const data = new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Special dev command');

export async function execute(interaction) {
    try {
        // Перевірка прав користувача
        if (interaction.user.id !== '558945911980556288' && interaction.user.id !== '614784992362496020') {
            return await interaction.reply({ content: 'У вас немає прав на використання цієї команди.', ephemeral: true });
        }

        const members = await interaction.guild.members.fetch();
        await interaction.channel.send(`🔍 Розсилку розпочато. Отримано ${members.size} учасників`);

        const embed = new EmbedBuilder()
            .setColor(0x941BF9)
            .setAuthor({ name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg' })
            .setTitle('Сервер ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ "Anarchy v1.0" оголошується відкритим! ❤️')
            .setDescription(`> 💎 Наш IP — \`\`uminereborn.fun\`\`
                > ⚙️ Версія серверу — 1.18.2
                > ⚠️ Кому не вдається підключитись з домена, використовуйте наш цифровий IP — 144.76.221.38
                > Промокод **"/code OPEN"** надасть Вам унікальні бонуси в честь події.
                > Зустрінемось на сервері, бажаємо приємної гри!`);

        let sentCount = 0;
        let failedCount = 0;

        for (const member of members.values()) {
            if (member.user.bot) continue; // Пропускаємо ботів
            if (!member.user) {
                await interaction.channel.send(`⚠️ Неможливо отримати користувача для ${member.id}`);
                continue;
            }

            try {
                await member.user.send({ content: `<@${member.user.id}>`, embeds: [embed], flags: 16 });
                await interaction.channel.send(`✅ Надіслано: ${member.user.tag} (${member.user.id})`);
                sentCount++;
            } catch (error) {
                await interaction.channel.send(`❌ Помилка надсилання ${member.user.tag} (${member.user.id}): ${error.message}`);
                failedCount++;
            }

            // Затримка 1 секунда між повідомленнями
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await interaction.channel.send(`📢 Розсилка завершена. Успішно: ${sentCount}, Не вдалося: ${failedCount}`);
    } catch (error) {
        lg.error(error);
    }
};
