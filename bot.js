const TelegramBot = require('node-telegram-bot-api').default;

// Вставь сюда свой токен от BotFather
const token = 'TOKEN HERE';

// Создаем бота
const bot = new TelegramBot(token, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

// Команда /help - список команд
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
📋 Список команд:

/help - список команд с описанием
/site - ссылка на сайт Октагона
/creator - ФИО создателя бота
    `.trim();
    
    bot.sendMessage(chatId, helpText);
});

// Команда /site - ссылка на сайт
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сайт Октагона: https://octagon-students.ru/');
});

// Команда /creator - ФИО создателя
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Создатель бота: Сокорев Владимир');
});

console.log('Бот запущен...');