const TelegramBot = require('node-telegram-bot-api').default;
const mysql = require('mysql2');

// Вставь сюда свой токен от BotFather
const token = '8831313711:AAHA1XuI1x6OGW4KilT2W6ywQKahsTLtqoc';

// Создаем бота
const bot = new TelegramBot(token, { polling: true });

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ChatBotTests'
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err);
        return;
    }
    console.log('Бот подключен к базе данных ChatBotTests');
});

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

/start - приветствие
/help - список команд с описанием
/site - ссылка на сайт Октагона
/creator - ФИО создателя бота
/randomItem - случайный предмет из БД
/deleteItem {id} - удалить предмет по ID
/getItemByID {id} - получить предмет по ID
    `.trim();
    
    bot.sendMessage(chatId, helpText);
});

// Команда /site - ссылка на сайт
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сайт Октагона: https://octagon.ru');
});

// Команда /creator - ФИО создателя
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Создатель бота: Сокорев Владимир');
});

// Команда /randomItem - случайный предмет
bot.onText(/\/randomItem/, (msg) => {
    const chatId = msg.chat.id;
    
    const sql = 'SELECT * FROM Items ORDER BY RAND() LIMIT 1';
    db.query(sql, (err, results) => {
        if (err || results.length === 0) {
            return bot.sendMessage(chatId, 'Ошибка: база данных пуста или произошла ошибка');
        }
        
        const item = results[0];
        bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
    });
});

// Команда /deleteItem - удалить предмет по ID
bot.onText(/\/deleteItem (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1];
    
    if (!id || isNaN(id)) {
        return bot.sendMessage(chatId, 'Ошибка: укажите корректный ID');
    }
    
    const sql = 'DELETE FROM Items WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return bot.sendMessage(chatId, 'Ошибка');
        }
        
        if (result.affectedRows === 0) {
            bot.sendMessage(chatId, 'Ошибка: предмет не найден');
        } else {
            bot.sendMessage(chatId, 'Удачно');
        }
    });
});

// Команда /getItemByID - получить предмет по ID
bot.onText(/\/getItemByID (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1];
    
    if (!id || isNaN(id)) {
        return bot.sendMessage(chatId, 'Ошибка: укажите корректный ID');
    }
    
    const sql = 'SELECT * FROM Items WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            return bot.sendMessage(chatId, 'Ошибка: предмет не найден');
        }
        
        const item = results[0];
        bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
    });
});

console.log('Бот запущен...');