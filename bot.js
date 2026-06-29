const TelegramBot = require('node-telegram-bot-api').default;

const token = '8831313711:AAHA1XuI1x6OGW4KilT2W6ywQKahsTLtqoc';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет, октагон!');
});

console.log('Бот запущен...');