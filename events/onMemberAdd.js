import { Events, EmbedBuilder, WebhookClient } from 'discord.js';
import 'dotenv/config';
import Logger from '../utils/logs.js';

const lg = new Logger('Bot');

export default {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const role_id = '1353289771442638899';

        try {
   
            const role = await member.guild.roles.fetch(role_id);
            if (role) await member.roles.add(role);

            const invites = await member.guild.invites.fetch();
            const usedInvite = invites.find(inv => inv.uses > 0);
            let inviteSource = usedInvite?.code || 'Невідомо';
            if (!usedInvite && member.guild.vanityURLCode) {
                inviteSource = `Кастомне посилання: ${member.guild.vanityURLCode}`;
            }

            // Побудова Embed
            const embed = new EmbedBuilder()
                .setTitle('Користувач приєднався')
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Учасник', value: `${member.user.tag} | \`\`${member.user.id}\`\``, inline: true },
                    { name: 'Інвайт', value: inviteSource, inline: true },
                    { name: 'Створено ким', value: `${usedInvite?.inviter?.tag} | \'\'${usedInvite?.inviter?.id}\'\' ` || 'Невідомо', inline: true },
                    { name: 'Кількість використань', value: usedInvite?.uses?.toString() || 'Невідомо', inline: true }
                )
                .setTimestamp()
                .setColor(0x36ce36);

            const webhook = new WebhookClient({ url: process.env.JOIN_LOG_URL });
            await webhook.send({ embeds: [embed] });

            lg.info(`Учасник ${member.user.tag} приєднався. Інвайт: ${inviteSource}`);
        } catch (e) {
            lg.error(`Помилка при обробці GuildMemberAdd: ${e}`);
        }
    }
};