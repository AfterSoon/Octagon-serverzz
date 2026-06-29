const TelegramBot = require('node-telegram-bot-api').default;

const token = 'TOKEN HERE';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет, октагон!');
});

console.log('Бот запущен...');