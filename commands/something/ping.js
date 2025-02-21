import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import moment from "moment";
import 'moment-duration-format'
import { version } from 'discord.js';
import Logger from '../../utils/logs.js'
const lg = new Logger('Bot')

    export const data =  new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')

    // Визначення execute з параметром client
    export async function execute(interaction) {
        // Перевіряємо, чи доступне uptime через переданий client
        const client = interaction.client
        if (!client.uptime) {
            return interaction.reply("На жаль, не вдалося отримати аптайм бота. Спробуйте ще раз.");
        }

        // Відправляємо повідомлення "Pinging..." і отримуємо його
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

        // Форматуємо uptime з переданого client
        const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");

        // Створюємо ембед
        const ExampleEmbed = new EmbedBuilder()
            .setColor(0x427bff)
            .setTitle('⚙Статистика бота:')
            .addFields(
                { name: 'Пінг бота', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
                { name: 'Аптайм', value: `${duration}`, inline: true },
				{ name: 'Бібліотека', value: `\`\`discord.js v${version}\`\``, inline: false },
				{ name: 'Розробник', value: `Maksym_Tyvoniuk`, inline: false }
            )
            .setTimestamp();

        // Якщо вже є відповідь, редагуємо її
        if (interaction.replied) {
            await interaction.editReply({ content: '', embeds: [ExampleEmbed] });
        } else {
            await interaction.reply({ content: '', embeds: [ExampleEmbed] });
        }
};
