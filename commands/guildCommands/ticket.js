import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders'
import Logger from '../../utils/logs.js'
const lg = new Logger('Bot')
// Глобальна змінна для cooldown
const cooldowns = new Map();

    export const data =  new SlashCommandBuilder()
        .setName('setupticket')
        .setDescription('Реєструє систему tickets на сервері')

    export async function execute(interaction) {
        try {
            const client = interaction.client;

            // Отримуємо канал та гільдію
            const ticket_channel_guild = client.guilds.cache.get("986606248902414396"); // Отримуємо гільдію
            const ticket_channel = client.channels.cache.get("1329088167021907998"); // Отримуємо канал

            if (!ticket_channel || !ticket_channel_guild) {
                return interaction.reply({ content: 'Канал або гільдія не знайдені. Перевірте ID.', ephemeral: true });
            }

            const userId = interaction.user.id;
            
            // Створюємо меню
            const menu = new StringSelectMenuBuilder()
                .setCustomId('1')
                .setPlaceholder('Оберіть послугу, яку бажаєте придбати.')
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel('💰 Карбованці').setValue('server_money'),
                    new StringSelectMenuOptionBuilder().setLabel('🎁 Донат-кейс').setValue('donate_case'),
                    new StringSelectMenuOptionBuilder().setLabel('🤴 𝐊𝐈𝐍𝐆').setValue('king'),
                    new StringSelectMenuOptionBuilder().setLabel('🎩 𝐋𝐎𝐑𝐃').setValue('lord'),
                    new StringSelectMenuOptionBuilder().setLabel('🔱 𝐇𝐄𝐑𝐎').setValue('hero'),
                    new StringSelectMenuOptionBuilder().setLabel('⚔️ 𝐊𝐍𝐈𝐆𝐇𝐓').setValue('knight'),
                    new StringSelectMenuOptionBuilder().setLabel('👒 𝐑𝐀𝐍𝐆𝐄𝐑').setValue('ranger')
                );

            const row = new ActionRowBuilder().addComponents(menu);

            // Створюємо Embed
            const ExampleEmbed = new EmbedBuilder()
                .setColor(0x951bf9)
                .setAuthor({ name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg' })
                .setTitle('💎 Платні послуги серверу ')
                .setDescription(
                    
                    "Платні послуги створені для підтримки сервера у фінансовій сфері.\n" +
                    "Будь-який Ваш внесок допоможе нам в реалізації Ваших ідей та пропозицій.\n\n" +
                    "\n" +
                    "💸 **Вартість за послуги:**\n" +
                    "\n```" +
                    "💰 2 Карбованці - 1 UAH;\n" +
                    "🎁 Донат-кейс - 169 UAH;\n" +
                    "🤴 𝐊𝐈𝐍𝐆 - 449 UAH;\n" +
                    "🎩 𝐋𝐎𝐑𝐃 - 279 UAH;\n" +
                    "🔱 𝐇𝐄𝐑𝐎 - 169 UAH;\n" +
                    "⚔️ 𝐊𝐍𝐈𝐆𝐇𝐓 - 89 UAH;\n" +
                    "👒 𝐑𝐀𝐍𝐆𝐄𝐑 - 39 UAH.\n" +
                    "```\n\n" +
                    "⁉️ **Як здійснюється оплата?**\n" +
                    "\n"+
                    "1. Оберіть послугу знизу та натисніть \"Підтвердити\";\n" +
                    "2. Введіть Ваш точний ігровий нікнейм;\n" +
                    "3. Якщо Ви обрали \"Карбованці\", введіть кількість;\n" +
                    "4. В створеному каналі очікуйте на подальші інструкції."
                );
                

            // Надсилаємо Embed із меню
            await ticket_channel.send({
                embeds: [ExampleEmbed],
                components: [row]
            });

            // Відповідаємо на slash-команду
            await interaction.reply({ content: 'Панель успішно створено!', ephemeral: true });

        } catch (error) {
            lg.error(error);
        }
};
