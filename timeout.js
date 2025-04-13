import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import Logger from '../../utils/logs.js';
const lg = new Logger('Bot');

export const data = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Видає таймаут користувачу')
    .addStringOption(option =>
        option.setName('user')
            .setDescription('Виберіть користувача якому хочете видати покарання')
            .setRequired(true)
            .setAutocomplete(true) // Включає автодоповнення
    )
    .addStringOption(option =>
        option.setName('time')
            .setDescription('Час в хвилинах, на який буде заблоковано людину')
            .setRequired(true)

    )

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has('614784992362496020') || (!interaction.member.roles.cache.has('614784992362496020'))) {
        lg.info('Не можна користувачу виконувати цю команду.');
        return interaction.reply({ content: 'У вас немає прав для використання цієї команди.', ephemeral: true });
    }

    const userId = interaction.options.getString('user');
    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!member) {
        return interaction.reply({ content: 'Користувач не знайдений.', ephemeral: true });
    }

    await member.timeout

    await interaction.reply({ content: `Ви вибрали користувача: ${member.user.tag}`, ephemeral: true });
}

export async function autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const members = await interaction.guild.members.fetch();

    const choices = members.map(member => ({
        name: member.user.tag,
        value: member.id
    })).filter(choice => choice.name.toLowerCase().includes(focusedValue)).slice(0, 25); // Максимум 25 варіантів

    await interaction.respond(choices);
}
