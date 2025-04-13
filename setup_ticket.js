import { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Logger from '../../utils/logs.js';

const lg = new Logger('TicketSetup');

export const data = new SlashCommandBuilder()
    .setName('setup_ticket')
    .setDescription('Створює панель для відкриття тікетів')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('Канал для розміщення панелі')
        .setRequired(true));

export async function execute(interaction) {
    try {
        const channel = interaction.options.getChannel('channel');
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🛠 Технічна підтримка')
            .setDescription('Натисніть кнопку нижче, щоб створити тікет');
        
        const button = new ButtonBuilder()
            .setCustomId('ticket_create')
            .setLabel('Створити тікет')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📩');
        
        const row = new ActionRowBuilder().addComponents(button);
        
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({
            content: '✅ Панель для тікетів успішно створена!',
            ephemeral: true
        });
        
        lg.info(`Панель створена в каналі ${channel.name} (${channel.id})`);
    } catch (error) {
        lg.error(`Помилка при створенні панелі: ${error}`);
        await interaction.reply({
            content: '❌ Помилка при створенні панелі',
            ephemeral: true
        });
    }
}