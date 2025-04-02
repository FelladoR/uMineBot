import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, Events, WebhookClient} from 'discord.js';
import dotenv from 'dotenv';
import 'dotenv/config';
import svgCaptcha from 'svg-captcha';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp'; 
import { dirname } from 'path';
import Logger from '../utils/logs.js'
const lg = new Logger('Bot')

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const VERIFICATION_ROLE_ID = process.env.VERIFICATION_ROLE_ID;
const UNVERIFED_ROLE_ID = process.env.UNVERIFED_ROLE_ID;
const CAPTCHA_STORAGE = new Map();

const generateCaptchaImage = () => {
    const captcha = svgCaptcha.create({
        size: 4,
        noise: 3,
        width: 350,
        height: 100,
        color: true,
        background: '#1a1a1a',
        fontSize: 70,
        ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-={}[]|;:"\'<>,.?/',
    });

    return captcha;
};

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {

            const webhook = new WebhookClient({ url: process.env.CAPTCHA_LOG_URL });

            if (interaction.isButton()) {
                if (interaction.customId === 'verifyBtn') {
                    const verifyRole = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                    if (!verifyRole) {
                        return interaction.reply({ content: 'Роль верифікації не знайдена. Будь ласка, зв\'яжіться з адміністрацією.', ephemeral: true });
                    }

                    if (interaction.member.roles.cache.has(verifyRole.id)) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder().setColor('#ffffff').setTitle(`Ви вже верифіковані.`)],
                            ephemeral: true,
                        });
                    }

                    const { text, data: captchaImage } = generateCaptchaImage();
                    CAPTCHA_STORAGE.set(interaction.user.id, text);

                    const filePath = `captcha_${interaction.user.id}.png`;
                    await sharp(Buffer.from(captchaImage))
                        .png()
                        .toFile(filePath);

                        lg.info('Captcha image saved to:', filePath);

                    let enterBtnRow = new ActionRowBuilder().addComponents([
                        new ButtonBuilder().setCustomId('openModal').setLabel('Ввести').setStyle(3),
                    ]);

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ffffff')
                                .setTitle('Перевірка на робота')
                                .setDescription(`Будь ласка, натисніть кнопку **Ввести** нижче і введіть код капчі.`)
                                .setFooter({ text: 'У вас є 60 секунд, щоб завершити капчу' })
                                .setImage(`attachment://${filePath}`),
                        ],
                        components: [enterBtnRow],
                        files: [{ attachment: filePath, name: filePath }],
                        ephemeral: true,
                    });

                    setTimeout(() => {
                        fs.unlinkSync(filePath);
                    }, 5000);

                    lg.info('Captcha image sent in response');
                }
            }

            if (interaction.customId === 'openModal') {
                const modal = new ModalBuilder()
                    .setCustomId('captcha-modal')
                    .setTitle('Перевірте себе')
                    .addComponents([
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('captcha-input')
                                .setLabel('Введіть капчу')
                                .setStyle(1)
                                .setMaxLength(4)
                                .setPlaceholder('наприклад, 1234')
                                .setRequired(true),
                        ),
                    ]);

                await interaction.showModal(modal);
            }

            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'captcha-modal') {
                    const response = interaction.fields.getTextInputValue('captcha-input').trim();
                    const correctAnswer = CAPTCHA_STORAGE.get(interaction.user.id)?.trim();

                    if (!correctAnswer) {
                        return interaction.reply({ content: 'Капча застарала. Будь ласка, спробуйте знову.', ephemeral: true });
                    }

                    let captchaMessage;
                    let captchaLog;
                    if (response === correctAnswer) {
                        captchaMessage = new EmbedBuilder()
                            .setColor('#ffffff')
                            .setTitle('🎉 Ви успішно пройшли верифікацію!')
                            .setDescription('Тепер ви маєте доступ до серверу!');

                        captchaLog = new EmbedBuilder()
                            .setColor(0x7dd321)
                            .setTitle(`Користувач виконав капчу`)
                            .addFields(
                                { name: "Користувач:", value: `${interaction.user} | \`\`${interaction.user.id}\`\``, inline: false},
                                { name: "Отримана відповідь", value: `**${response}**`}
                                
                            )


                        const verifyRole = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                        const unverifedRole = interaction.guild.roles.cache.get(UNVERIFED_ROLE_ID);
                        if (unverifedRole) {
                            await interaction.member.roles.remove(unverifedRole).catch(e => lg.error(e));
                        }
                        if (verifyRole) {
                            await interaction.member.roles.add(verifyRole).catch(e => lg.error(e));
                        }

                        CAPTCHA_STORAGE.delete(interaction.user.id);
                    } else {
                        captchaMessage = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle(`💀 Ви провалили верифікацію`)
                            .setDescription('Ви ввели неправильну капчу... Будь ласка, спробуйте ще раз.');

                        captchaLog = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle(`Користувач провалив капчу`)
                            .addFields(
                                { name: "Користувач:", value: `${interaction.user} | \`\`${interaction.user.id}\`\``, inline: false},
                                { name: "Надіслана капча:", value: `**${correctAnswer}**`, inline: true},
                                { name: "Отримана відповідь", value: `**${response}**`}
                                
                            )
                    }

                    await Promise.all(
                        [
                            webhook.send({ embeds: [captchaLog] }).catch(error => { lg.error(error)}),
                            interaction.reply({ embeds: [captchaMessage], ephemeral: true }).catch(error => { lg.error(error)}),
                        ]

                    )

                }
            }
        } catch (error) {
            lg.error('Error in interaction create event:', error);
        }
    }
};
