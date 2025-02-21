import { Events, MessageFlags, EmbedBuilder, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionOverwriteManager, PermissionOverwrites, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, flatten } from 'discord.js';
import 'dotenv/config'
import Logger from '../utils/logs.js'
const lg = new Logger('Bot')

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			lg.warn(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {

			await command.execute(interaction);
		} catch (error) {
			lg.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	}
}
}