
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
                .setColor("#2F3136") // Темно-сірий фон для кращого вигляду
                .setTitle(`🔹 Верифікація на сервері ${interaction.guild.name}`)
                .setDescription(
                    `Щоб отримати доступ до серверу, підтвердьте, що ви людина, виконавши капчу.  
                    Натисніть кнопку **"Verify"** нижче, щоб почати!`
                )
                .addFields(
                    {
                        name: "🇺🇦 Ласкаво просимо!",
                        value: `**1️⃣** Натисніть **"Verify"**  
                                **2️⃣** Введіть капчу  
                                **3️⃣** Насолоджуйтесь сервером!`,
                        inline: true
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true })) // Додає аватар гільдії
                .setFooter({
                    text: "З повагою, Адміністрація сервера. ❤️",
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                });

            let btnRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("verifyBtn")
                    .setLabel("✅ Verify")
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
