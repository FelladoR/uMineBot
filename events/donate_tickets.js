import { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, EmbedBuilder, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionOverwriteManager, PermissionOverwrites, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, embedLength, Message } from 'discord.js';
import 'dotenv/config'
import fs from 'fs'
const userData = new Map()
const cooldowns = new Map()
import Ticket from '../Schemas/donate_ticketSchema.js'
import Logger  from '../utils/logs.js'
const lg = new Logger('Bot')

export default{
    name: Events.InteractionCreate,
    async execute(interaction) {
        
    
    // Відкриття самого тікету
    async function open_ticket(player_nickname, server_money_emount) {
        
        const guild = interaction.guild
        const category = await interaction.client.channels.cache.get("1329191090808688660")
        const admin_role = await interaction.guild.roles.cache.get("1195308620179570830")
            if (!category || category.type !== 4) { 
                lg.warn('Категорія не знайдена або неправильного типу');
                return;
            }
            if(!category || category.type === 4) { 
                try{
                    await interaction.update({
                        content: '✅ Ви підтвердили свій вибір!',
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('confirm') // Шукаємо кнопку за customId
                                    .setLabel('Підтверджено')
                                    .setStyle(ButtonStyle.Success)
                                    .setDisabled(true) // Робимо кнопку недоступною
                            )
                        ]
                    });
                lg.info('Хто взаємодіє:'+ interaction.user.id)
                const member = interaction.user.id
                const ticket_channel = await interaction.guild.channels.create({
                    name: "донат-" + player_nickname,
                    type: 0,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: member,
                            allow: [PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: admin_role,
                            deny: [PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                    
                })

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: `✅ Вашу заявку було надіслано, перейдіть в канал: ⁠<#${ticket_channel.id}>`  , flags: MessageFlags.Ephemeral});
                }
                
                return ticket_channel

            }catch(error) {
                lg.error('Виникла помилка при спробі відкрити тікет:'+ error)
                return
            }
        }
    }

   
    // Функція підтвердження придбання донату, після якої з'являється поле для вводу нікнейму
    async function accept() {
        if (interaction.customId ==='1') {

            const donateOptions = {
                donate_case: '**🎁 Донат-кейс**',
                server_money: '**💰Карбованці**',
                king: '🤴𝐊𝐈𝐍𝐆',
                lord: '🎩𝐋𝐎𝐑𝐃',
                hero: '🔱𝐇𝐄𝐑𝐎',
                knight: '⚔️𝐊𝐍𝐈𝐆𝐇𝐓',
                ranger: '👒𝐑𝐀𝐍𝐆𝐄𝐑'
            };

            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Підтвердити')
                .setStyle(ButtonStyle.Success)

            const row = new ActionRowBuilder()
                .addComponents(confirm)

            lg.info('ID:'+ interaction.values[0])
            const selected_donate = interaction.values[0]
            const label = donateOptions[selected_donate];
            interaction.user.selected_donate = selected_donate
            lg.info('Значення:'+selected_donate)
            const embed = new EmbedBuilder()
                .setColor(0x7dd321)
                .setAuthor({name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg'})
                .setTitle('✅ Хороший вибір!')
                .setDescription(`Ви обрали послугу "${label}", якщо бажаєте придбати її, натисніть на кнопку "**Підтвердити**". Після цього, створиться окремий канал з Вашою заявкою, де Ви повинні очікувати на подальші інструкції.`)
                .setFooter({text: `З повагою, Адміністрація сервера. ❤️`})

            if(!interaction.replied && !interaction.deferred) {
            await interaction.reply({embeds: [embed], ephemeral: true, components: [row]})
            }
        }
    }
    // Кнопка підтвердження
    if (interaction.customId === 'confirm') {
        try{
            // const isOnCooldown = await check_modal_cooldown(interaction);
            // if (isOnCooldown) return; // Якщо взаємодія завершена, виходимо

            if(interaction.user.selected_donate=='server_money') {
                const modalMenu = new ModalBuilder()
                    .setCustomId('modalMenu_title')
                    .setTitle('Заповніть заявку нижче.')
                
                const player_nickname_input = new TextInputBuilder()
                    .setCustomId('player_nickname')
                    .setLabel('Нікнейм:')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(3)
                    .setMaxLength(16)
                const server_money_emount = new TextInputBuilder()
                    .setCustomId('server_money_emount')
                    .setLabel('Кількість карбованців:')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)
                    .setMaxLength(16)

                let row1 = new ActionRowBuilder().addComponents(player_nickname_input)
                let row2 = new ActionRowBuilder().addComponents(server_money_emount)
                modalMenu.addComponents(row1, row2)
                await interaction.showModal(modalMenu)
 
        }else if(interaction.user.selected_donate != 'server_money') {
  
            const modalMenu = new ModalBuilder()
                .setCustomId('modalMenu_title')
                .setTitle('Введіть Ваш ігровий нікнейм.')
            
            const player_nickname_input = new TextInputBuilder()
                .setCustomId('player_nickname')
                .setLabel('Нікнейм:')
                .setStyle(TextInputStyle.Short)
                .setMinLength(3)
                .setMaxLength(16)

            let row1 = new ActionRowBuilder().addComponents(player_nickname_input)
            modalMenu.addComponents(row1)
            await interaction.showModal(modalMenu)

        }
        }catch(error) {
            lg.error('Виникла помилка під час спроби виконання функції open_ticket'+error)
            return
    }
}

    if(interaction.isModalSubmit()){
        if (interaction.customId === 'modalMenu_title') {
            try{
                const player_nickname = interaction.fields.getTextInputValue('player_nickname');
                let server_money_emount = null;
                const selected_donate = interaction.user.selected_donate;
                
                // Перевіряємо наявність поля server_money_emount
                if(selected_donate=="server_money") {
                    if (interaction.fields.getTextInputValue('server_money_emount')) {
                        server_money_emount = interaction.fields.getTextInputValue('server_money_emount');
                        const isNumber = isNaN(server_money_emount);

                        if(isNumber === true ) {
                            await interaction.reply({content: '**❌Будь ласка, вкажіть кількість карбованців як число**', flags: MessageFlags.Ephemeral})
                        }

                    }else if(!interaction.fields.getTextInputValue('server_money_emount')){
                        server_money_emount = null
                    }
                }
                
                const ticket_channel = await open_ticket(player_nickname, server_money_emount)
                
                if (ticket_channel) {
                    await send_embed_to_ticket(ticket_channel, player_nickname, server_money_emount)
                } else {
                    lg.warn('Не вдалось знайти канал тікету')
                }
            }catch(error) {
                lg.error(error)
            }
            
        }
        
    }

    async function send_embed_to_ticket(ticket_channel, player_nickname, server_money_emount) {
        let selected_donate = interaction.user.selected_donate;
        lg.debug(selected_donate)
        let price; 

        if (server_money_emount) {
            price = server_money_emount / 2; 
        } else {
            price = userData.get(interaction.user.id).price; 
        }
        
        if(selected_donate!="server_money") {
            if(selected_donate=='donate_case') selected_donate ='донат-кейс'
            const embed = new EmbedBuilder()
                    .setColor(0x941BF9)
                    .setAuthor({name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg'})
                    .setTitle('📝 Заявка на купівлю послуги')
                    .setDescription(`Вітаємо шановний гравець! Власник сервера зв'яжеться з Вами на протязі наступних 24-х годин.
`)
                    .addFields(
                        { name: '👤 Учасник:', value: `<@${interaction.user.id}> | \`\`${interaction.user.id}\`\``, inline: true },
                        { name: '🎮 Ігровий нікнейм:', value: `${player_nickname}`, inline: true },
                        { name: '💎 Послуга:', value: selected_donate},
                        { name: "💸 Вартість:", value: `${price} UAH`}
                    )
                    .setFooter({text: `З повагою, Адміністрація сервера. ❤️`})
                    await ticket_channel.send({ /*content: "<@&986676059237916693>", */embeds: [embed], components: admin_buttons})
                    const ticketData =  await new Ticket({ _id: ticket_channel.id, author_id: interaction.user.id, player_minecraft_nickname: player_nickname , donate: selected_donate, role_id: userData.get(interaction.user.id).roleId})
                    await ticketData.save()

        }else if(selected_donate=='server_money') {
            const embed = new EmbedBuilder()
                .setColor(0x941BF9)
                .setAuthor({name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg'})
                .setTitle('📝 Заявка на купівлю послуги')
                .setDescription(`Вітаємо шановний гравець! Власник сервера зв'яжеться з Вами на протязі наступних 24-х годин.
`)
                .addFields(
                    { name: '👤 Учасник:', value: `<@${interaction.user.id}> | \`\`${interaction.user.id}\`\``, inline: true },
                    { name: '🎮 Ігровий нікнейм:', value: `${player_nickname}`, inline: true },
                    { name: '💎 Послуга:', value: `${server_money_emount} карбованців`},
                    { name: "💸 Вартість:", value: `${price} UAH`}
                )
                .setFooter({text: `З повагою, Адміністрація сервера. ❤️`})
                await ticket_channel.send({content: "<@&986676059237916693>", embeds: [embed], components: admin_buttons})
                const ticketData =  await new Ticket({ _id: ticket_channel.id, author_id: interaction.user.id, player_minecraft_nickname: player_nickname ,donate: selected_donate })
                await ticketData.save()
            }
            
}
    

if (interaction.customId === '1') {
    let roleId;
    let price;
    const selectedValue = interaction.values[0]; 

    switch (selectedValue) {
        case 'server_money':
            roleId = null
            accept()
            break;
        case 'donate_case':
            roleId = null
            price = "169"
            accept()
            break;
        case 'king':
            roleId = '1284829002665820182'
            price = "449"
            accept()
            break;

        case 'lord':
            roleId= '1284828634934411334'
            price = "279"
            accept()
            break;

        case 'hero':
            roleId= '1284828324798926889'
            price= "169"
            accept()
            break;

        case 'knight':
            roleId = '1284824071149715498'
            price = "89"
            accept()
            break;

        case 'ranger':
            roleId = '1284823734074736640'
            accept()
            price = "39"
            break;

        default:
            roleId = undefined;
            price: "0"
            accept()
            break;

    }
    
    
    userData.set(interaction.user.id, { roleId, price })
    const testdata = userData.get(interaction.user.id);
}

if(interaction.customId=='2') {

    const selectedOption = interaction.values[0]
    if(interaction.user.id =='614784992362496020' || interaction.user.id =='558945911980556288') {
        if(selectedOption =='accepted') {
            let ticketData = await Ticket.findOne({ _id: interaction.channel.id})
            const role_to_give = ticketData.role_id
            const author_id = ticketData.author_id
            const author = await interaction.guild.members.fetch(author_id)
            if(role_to_give) {
                await author.roles.add(role_to_give)
            }
            try{
                const ExampleEmbed = new EmbedBuilder()
                .setColor(0x951bf9)
                .setAuthor({name: 'ᴜᴍɪɴᴇ ʀᴇʙᴏʀɴ', iconURL: 'https://i.imgur.com/dEpXhnr.jpeg'})
                .setTitle('✅ Вітаємо Вас з покупкою послуги!')
                .setDescription("Завдяки Вам ми можемо продовжувати вдосконалювати ігровий процес, додавати нові функції та створювати унікальний досвід для всіх гравців. Ваш внесок не лише сприяє розвитку, а й надихає нас працювати ще старанніше!")
                .setFooter({text: "З повагою, Адміністрація сервера. ❤️"})

                await author.send({ content: `<@${author.id}>`, embeds: [ExampleEmbed] })
            }catch(error) {
                lg.error('Не вдалось відправити повідомлення користувачу')
            }
            close_ticket()
            }else if(selectedOption =='declined') {
                close_ticket()
            } 
        }else{
            interaction.reply({content: '**❌ У Вас недостатньо прав.**', flags: MessageFlags.Ephemeral})
        }
}
if (interaction.customId === 'cancel_ticket') {
    close_ticket()
    
}
async function close_ticket() {
    const channel = interaction.channel; 
    const logChannel = interaction.client.channels.cache.get('1330540545382285383'); 

    if (!logChannel) {
        lg.warn('Канал логів не знайдено.');
        return;
    }
    if (!interaction.channel || interaction.channel.type !== 0) {
        lg.warn("Канал не знайдено або це не текстовий канал.");
        return;
    }

    try {
       
        let messages = [];
        let lastMessageId = null;

        while (true) {

            const fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
            if (fetchedMessages.size === 0) break;

            messages = messages.concat(Array.from(fetchedMessages.values()));
            lastMessageId = fetchedMessages.last().id;
        }



        const data = messages
            .map(msg => `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}`)
            .reverse()
            .join('\n');


        const filePath = './messages.txt';
        fs.writeFileSync(filePath, data);
        
        const ExampleEmbed = new EmbedBuilder()
        .setColor(0x951bf9)
        .setTitle('Тікет закрито')
        .setTimestamp()
        .addFields(
            { name: 'Канал', value: `${channel.name}`, inline: true },
            { name: 'Report ID', value: `\`\`${channel.id}\`\``, inline: true },
            { name: 'Закрив', value: `${interaction.user.username} || \`\`${interaction.user.id}\`\``, inline: false },
        )

        await logChannel.send({
            embeds: [ExampleEmbed],
            files: [filePath],
        });


        // Видалення каналу
        await channel.delete();
    } catch (error) {
        lg.error('Сталася помилка:', error);
    }
}
}
}


const cancel_ticket = new ButtonBuilder()
    .setCustomId('cancel_ticket')
    .setLabel('Скасувати заявку')
    .setStyle(ButtonStyle.Danger);

const menu = new StringSelectMenuBuilder() 
    .setCustomId('2')
    .setPlaceholder('Панель адміністрації')

    .addOptions(
        new StringSelectMenuOptionBuilder()
            .setLabel('Схвалено')
            .setDescription('Учаснику видається роль, заявка закривається')
            .setEmoji('1325251784083509259')
            .setValue('accepted'),

        new StringSelectMenuOptionBuilder()
            .setLabel('Відхилено')
            .setDescription('Заявка закривається')
            .setEmoji('1325252206005456926')
            .setValue('declined')
    );

const menuRow = new ActionRowBuilder().addComponents(menu); 
const cancelRow = new ActionRowBuilder().addComponents(cancel_ticket);  


const admin_buttons = [menuRow, cancelRow];
