const TelegramBot = require('node-telegram-bot-api').default;
const mysql = require('mysql2');

// Вставь сюда свой токен от BotFather
const token = 'TOKEN HERE';

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
Список команд:

/start - приветствие
/help - список команд с описанием
/site - ссылка на сайт Октагона
/creator - ФИО создателя бота
/randomItem - случайный предмет из БД
/deleteItem {id} - удалить предмет по ID
/getItemByID {id} - получить предмет по ID

!qr {текст/ссылка} - генерация QR-кода
!webscr {ссылка} - скриншот сайта
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
const axios = require('axios');

// Команда !qr - генерация QR-кода
bot.onText(/!qr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    
    try {
        // Используем бесплатный API для генерации QR-кода
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
        
        // Отправляем изображение QR-кода
        await bot.sendPhoto(chatId, qrUrl, {
            caption: `QR-код для: ${text}`
        });
    } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при генерации QR-кода');
        console.error(error);
    }
});

// Команда !webscr - скриншот сайта (используем бесплатный API)
bot.onText(/!webscr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    let url = match[1].trim();
    
    // Добавляем http:// если не указан протокол
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    
    try {
        // Используем API thum.io (бесплатный, без регистрации)
        const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url&waitUntil=networkidle2`;
        
        await bot.sendPhoto(chatId, screenshotUrl, {
            caption: `Скриншот сайта: ${url}`
        });
    } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при создании скриншота');
        console.error('Ошибка скриншота:', error.message);
    }
});
console.log('Бот запущен...');