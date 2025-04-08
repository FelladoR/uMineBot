
import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'

	export const data = new SlashCommandBuilder()
		.setName('captcha')
		.setDescription('Встановлює канал для капчі')
		.setDefaultMemberPermissions(0)
		.addChannelOption(option => option
			.setName('destination')
			.setDescription('Виберіть канал куди надіслано embed')
			.setRequired(true))


	export async function execute(interaction) {

        if(!interaction.user.id == '558945911980556288' || !interaction.user.id == '614784992362496020') {
            console.log('Спроба застовувати адмінську команду')
            return
        }
		const verifyChannel = interaction.options.getChannel('destination');

		if (!verifyChannel) {
			return interaction.reply({
				content: `verifyChannel is not found`,
				ephemeral: true,
			});
		} else {
			let embed = new EmbedBuilder()
                .setColor("#9400FF") // Темно-сірий фон для кращого вигляду
	        .setAuthor({ name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg' })
                .setTitle(`Ласкаво просимо на сервер! 👋`)
                .setDescription(
                    
                    "Щоб отримати доступ до серверу, підтвердіть,\n" +
                    "що Ви не бот, виконавши звичайну капчу.\n" +
                    "\n" +
                    "✅ **Для верифікації потрібно:**\n" +
                    "\n```" +
                    "１. Натисніть кнопку “✔️ Верифікація”;\n" +
                    "２. Введіть капчу у поле, що з’явиться;\n" +
                    "３. Отримайте доступ до каналів.\n" +
                    "```\n\n"
                )
                .setFooter({
                    text: "З повагою, Адміністрація сервера. ❤️",
                });

            let btnRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("verifyBtn")
                    .setLabel("✔️ Верифікація")
                    .setStyle(3) // 3 = Success (зелена кнопка)
            );


			await verifyChannel.send({
				embeds: [embed],
				components: [btnRow],
			});

			interaction.reply({
				// content: `Verification system setup in ${verifyChannel}, users will get the ${verifyRole} role after completing the captcha.`,
				content: `Система верифікації призначена в ${verifyChannel}.`,
				ephemeral: true,
			});
		}
	}
