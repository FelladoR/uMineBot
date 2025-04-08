import { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import fs from 'fs';
import SupportTicket from '../Schemas/supportTicketSchema.js';
import Logger from './logs.js';

const lg = new Logger('TicketSystem');

// Команда для налаштування тікет-системи
export const setupTicketCommand = {
    data: new SlashCommandBuilder()
        .setName('setup_ticket')
        .setDescription('Налаштовує систему тікетів на сервері')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Канал для відправки кнопки тікету')
            .setRequired(true)),
    
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('channel');
            
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🔧 Технічна підтримка')
                .setDescription('Натисніть кнопку нижче, щоб створити тікет для звернення до адміністрації');
            
            const button = new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Створити тікет')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩');
            
            const row = new ActionRowBuilder().addComponents(button);
            
            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Система тікетів успішно налаштована!', ephemeral: true });
        } catch (error) {
            lg.error(`Помилка при налаштуванні тікет-системи: ${error}`);
            await interaction.reply({ content: 'Сталася помилка при налаштуванні системи.', ephemeral: true });
        }
    }
};

// Обробник подій для тікетів
export const ticketEventHandler = {
    name: 'interactionCreate',
    
    async execute(interaction) {
        try {
            // Обробка кнопки створення тікету
            if (interaction.isButton() && interaction.customId === 'create_ticket') {
                await handleCreateTicket(interaction);
            }
            
            // Обробка модального вікна
            if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {
                await handleTicketModal(interaction);
            }
            
            // Обробка закриття тікету
            if (interaction.isButton() && interaction.customId === 'close_ticket') {
                await handleCloseTicket(interaction);
            }
        } catch (error) {
            lg.error(`Помилка в обробнику тікетів: ${error}`);
        }
    }
};

// Функція для створення модального вікна тікету
async function handleCreateTicket(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle('Створення тікету');
    
    const problemInput = new TextInputBuilder()
        .setCustomId('problem_description')
        .setLabel('Опишіть вашу проблему або запит')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(10)
        .setMaxLength(1000)
        .setRequired(true);
    
    const actionRow = new ActionRowBuilder().addComponents(problemInput);
    modal.addComponents(actionRow);
    
    await interaction.showModal(modal);
}

// Функція для обробки модального вікна тікету
async function handleTicketModal(interaction) {
    const description = interaction.fields.getTextInputValue('problem_description');
    const user = interaction.user;
    
    try {
        // Створюємо канал для тікету
        const channel = await interaction.guild.channels.create({
            name: `ticket-${user.username}`,
            parent: '1354061802446786661', // ID категорії для тікетів
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: '1350589368741658655', // ID ролі адміністратора
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });
        
        // Створюємо embed для тікету
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`Тікет від ${user.username}`)
            .setDescription(description)
            .addFields(
                { name: 'Користувач', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Статус', value: '🔹 Відкрито', inline: true }
            )
            .setTimestamp();
        
        // Створюємо кнопку для закриття
        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Закрити тікет')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒');
        
        const row = new ActionRowBuilder().addComponents(closeButton);
        
        // Відправляємо повідомлення в тікет
        await channel.send({
            content: `<@${user.id}>, <@&1350589368741658655>`, // Повідомляємо користувача та адміністрацію
            embeds: [embed],
            components: [row]
        });
        
        // Зберігаємо тікет в базу даних
        const ticket = new SupportTicket({
            _id: channel.id,
            author_id: user.id,
            author_tag: user.tag,
            description: description,
            status: 'open',
            created_at: new Date()
        });
        
        await ticket.save();
        
        // Відповідаємо користувачу
        await interaction.reply({
            content: `✅ Ваш тікет було створено: ${channel}`,
            ephemeral: true
        });
        
    } catch (error) {
        lg.error(`Помилка при створенні тікету: ${error}`);
        await interaction.reply({
            content: '❌ Сталася помилка при створенні тікету. Спробуйте ще раз пізніше.',
            ephemeral: true
        });
    }
}

// Функція для закриття тікету
async function handleCloseTicket(interaction) {
    const channel = interaction.channel;
    const user = interaction.user;
    
    try {
        // Перевіряємо, чи користувач має право закривати тікет
        const ticket = await SupportTicket.findOne({ _id: channel.id });
        
        if (!ticket) {
            return interaction.reply({
                content: '❌ Цей канал не є тікетом або дані про тікет не знайдені.',
                ephemeral: true
            });
        }
        
        if (user.id !== ticket.author_id && !interaction.member.roles.cache.has('1350589368741658655')) {
            return interaction.reply({
                content: '❌ Ви не маєте прав для закриття цього тікету.',
                ephemeral: true
            });
        }
        
        // Оновлюємо статус тікету в базі даних
        ticket.status = 'closed';
        ticket.closed_by = user.id;
        ticket.closed_at = new Date();
        await ticket.save();
        
        // Видаляємо канал
        await channel.delete('Тікет закрито');
        
    } catch (error) {
        lg.error(`Помилка при закритті тікету: ${error}`);
        await interaction.reply({
            content: '❌ Сталася помилка при закритті тікету.',
            ephemeral: true
        });
    }
}