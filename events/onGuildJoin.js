import { Events, Collection, REST, Routes, EmbedBuilder } from 'discord.js';
import 'dotenv/config'
import Guild from '../Schemas/guildSchema.js'
import Logger from '../utils/logs.js'
const lg = new Logger('Bot')

export default {
    name: Events.GuildCreate,
    once: false,
    async execute(guild) {
        const client = guild.client
        let guildData = await Guild.findOne({ _id: guild.id})
        if(guildData) {
            await sendJoinLogs(guild, client)
            return
        } else {
            guildData = new Guild({ _id: guild.id})

            await guildData.save()
            await sendJoinLogs(guild, client)
        }
    }
}
async function sendJoinLogs(guild, client) {
    try {
        const supportserverid = process.env.SUPPORT_SERVER_ID;
        const devchannellogs = process.env.DEV_LOGS_ID;

        if (!client || !client.guilds) {
            return;
        }

        const support_server = await client.guilds.fetch(supportserverid);
        if (!support_server) {
            lg.warn(`Не вдалося знайти сервер із ID ${supportserverid}`);
            return;
        }

        const devlogchannel = await support_server.channels.fetch(devchannellogs);
        if (!devlogchannel) {
            lg.warn(`Не вдалося знайти канал із ID ${devchannellogs}`);
            return;
        }

        const ExampleEmbed = new EmbedBuilder()
            .setColor(0x427bff)
            .setTitle('Вхід на сервер')
            .addFields(
                { name: 'Гільдія', value: `${guild.name} | \`\`${guild.id}\`\``, inline: true }
            )
            .setTimestamp();

        await devlogchannel.send({ embeds: [ExampleEmbed] });
    } catch (error) {
        lg.error('Помилка у sendDevLogs:', error);
    }
}
