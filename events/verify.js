import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, Events } from 'discord.js';
import dotenv from 'dotenv';
import 'dotenv/config';
import { createCanvas, loadImage } from '@napi-rs/canvas';

dotenv.config();
const VERIFICATION_ROLE_ID = process.env.VERIFICATION_ROLE_ID;
const UNVERIFED_ROLE_ID = process.env.UNVERIFED_ROLE_ID;
const CAPTCHA_STORAGE = new Map();

const generateCaptchaImage = async (text) => {
    const width = 350, height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 7; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const xStart = width / 2 - (text.length * 25);
    for (let i = 0; i < text.length; i++) {
        ctx.fillStyle = `rgb(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55})`;
        ctx.fillText(text[i], xStart + i * 50, height / 2);
    }

    // Додаємо пустий об’єкт у toBuffer()
    return canvas.toBuffer('image/png', {});
};


export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isButton()) {
                if (interaction.customId === 'verifyBtn') {
                    const verifyRole = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                    if (!verifyRole) {
                        return interaction.reply({ content: 'Роль верифікації не знайдена. Будь ласка, зв\`яжіться з адміністрацією.', ephemeral: true });
                    }

                    if (interaction.member.roles.cache.has(verifyRole.id)) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder().setColor('#ffffff').setTitle(`Ви вже верифіковані.`)],
                            ephemeral: true,
                        });
                    }

                    const captchaAnswer = Math.floor(Math.random() * 1000) + 1000;
                    CAPTCHA_STORAGE.set(interaction.user.id, captchaAnswer);
                    const captchaImage = await generateCaptchaImage(captchaAnswer.toString());

                    let enterBtnRow = new ActionRowBuilder().addComponents([
                        new ButtonBuilder().setCustomId('openModal').setLabel('Enter').setStyle(3),
                    ]);

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ffffff')
                                .setTitle('Перевірка на робота')
                                .setDescription(`Please press the **Enter** button below and enter the captcha code.`)
                                .setFooter({ text: 'You have 60 seconds to complete the captcha' })
                                .setImage('attachment://captcha.png'),
                        ],
                        components: [enterBtnRow],
                        files: [{ attachment: captchaImage, name: 'captcha.png' }],
                        ephemeral: true,
                    });
                }

                if (interaction.customId === 'openModal') {
                    const modal = new ModalBuilder()
                        .setCustomId('captcha-modal')
                        .setTitle('Verify Yourself')
                        .addComponents([
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('captcha-input')
                                    .setLabel('Введіть капчу')
                                    .setStyle(1)
                                    .setMaxLength(4)
                                    .setPlaceholder('e.g., 1234')
                                    .setRequired(true),
                            ),
                        ]);

                    await interaction.showModal(modal);
                }
            }

            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'captcha-modal') {
                    const response = interaction.fields.getTextInputValue('captcha-input').trim();
                    const correctAnswer = CAPTCHA_STORAGE.get(interaction.user.id)?.toString().trim();
                    if (!correctAnswer) {
                        return interaction.reply({ content: 'Капча застарала. Будь ласка, спробуйте знову.', ephemeral: true });
                    }

                    let captchaMessage;
                    if (response === correctAnswer) {
                        captchaMessage = new EmbedBuilder()
                            .setColor('#ffffff')
                            .setTitle('🎉 Ви успішно пройшли верифікацію!')
                            .setDescription('Тепер ви маєте доступ до серверу!');

                        const verifyRole = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                        const unverifedRole = interaction.guild.roles.cache.get(UNVERIFED_ROLE_ID);
                        if (unverifedRole) {
                            await interaction.member.roles.remove(unverifedRole).catch(e => console.log(e));
                        }
                        if (verifyRole) {
                            await interaction.member.roles.add(verifyRole).catch(e => console.log(e));
                        }

                        CAPTCHA_STORAGE.delete(interaction.user.id);
                    } else {
                        captchaMessage = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle(`💀 Ви провалили верифікацію`)
                            .setDescription('Ви ввели неправильну капчу... Будь ласка, спробуйте ще раз.');
                    }

                    await interaction.reply({ embeds: [captchaMessage], ephemeral: true });
                }
            }
        } catch (error) {
            console.error('Error in interaction create event:', error);
        }
    }
};
