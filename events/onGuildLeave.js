import { Events, Collection, REST, Routes, EmbedBuilder } from 'discord.js';
import 'dotenv/config'
import Guild from '../Schemas/guildSchema.js'
import Logger from '../utils/logs.js'
const lg = new Logger('Bot')

export default{
    name: Events.GuildDelete,
    once: false,
    async execute(guild) {
        try {
            const client = guild.client

            const guildData = await Guild.findOne({ _id: guild.id });
            if (!guildData) {
                return;
            }

    
            await guildData.deleteOne();


            await sendDevLogs(guild, client);
        } catch (error) {
            lg.error('Помилка у GuildDelete:', error);
        }
    }
};

async function sendDevLogs(guild, client) {
    try {
        const supportserverid = process.env.SUPPORT_SERVER_ID;
        const devchannellogs = process.env.DEV_LOGS_ID;

        if (!client || !client.guilds) {
        
            return;
        }

        const support_server = await client.guilds.fetch(supportserverid);
        if (!support_server) {
        
            return;
        }

        const devlogchannel = await support_server.channels.fetch(devchannellogs);
        if (!devlogchannel) {
            lg.error(`Не вдалося знайти канал із ID ${devchannellogs}`);
            return;
        }

        const ExampleEmbed = new EmbedBuilder()
            .setColor(0x427bff)
            .setTitle('Вихід з серверу')
            .addFields(
                { name: 'Гільдія', value: `${guild.name} | \`\`${guild.id}\`\``, inline: true }
            )
            .setTimestamp();

        await devlogchannel.send({ embeds: [ExampleEmbed] });
    } catch (error) {
        lg.error('Помилка у sendDevLogs:', error);
    }
}
