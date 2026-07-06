const TelegramBot = require('node-telegram-bot-api').default;
const mysql = require('mysql2');
const axios = require('axios');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic');

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

// ===== ФУНКЦИЯ: Обновление даты последнего сообщения =====
function updateUserLastMessage(userId) {
    const today = new Date().toISOString().split('T')[0]; // формат YYYY-MM-DD
    
    const sql = `
        INSERT INTO Users (id, lastMessage) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE lastMessage = ?
    `;
    db.query(sql, [userId, today, today], (err) => {
        if (err) {
            console.error('Ошибка обновления пользователя:', err);
        }
    });
}

// ===== ФУНКЦИЯ: Получение случайного предмета =====
function getRandomItem(callback) {
    const sql = 'SELECT * FROM Items ORDER BY RAND() LIMIT 1';
    db.query(sql, (err, results) => {
        if (err || results.length === 0) {
            callback('База данных пуста');
            return;
        }
        const item = results[0];
        callback(`(${item.id}) - ${item.name}: ${item.desc}`);
    });
}

// ===== ОБРАБОТЧИК: Любое текстовое сообщение =====
bot.on('message', (msg) => {
    const userId = msg.from.id;
    updateUserLastMessage(userId);
});

// ===== КОМАНДА /start =====
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

// ===== КОМАНДА /help =====
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

!qr {текст/ссылка} - генерация QR-кода
!webscr {ссылка} - скриншот сайта
    `.trim();
    
    bot.sendMessage(chatId, helpText);
});

// ===== КОМАНДА /site =====
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сайт Октагона: https://octagon.ru');
});

// ===== КОМАНДА /creator =====
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Создатель бота: Сокорев Владимир');
});

// ===== КОМАНДА /randomItem =====
bot.onText(/\/randomItem/, (msg) => {
    const chatId = msg.chat.id;
    getRandomItem((text) => {
        bot.sendMessage(chatId, text);
    });
});

// ===== КОМАНДА /deleteItem =====
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

// ===== КОМАНДА /getItemByID =====
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

// ===== КОМАНДА !qr =====
bot.onText(/!qr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    
    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
        await bot.sendPhoto(chatId, qrUrl, {
            caption: `QR-код для: ${text}`
        });
    } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при генерации QR-кода');
        console.error(error);
    }
});

// ===== КОМАНДА !webscr =====
bot.onText(/!webscr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    let url = match[1].trim();
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    
    try {
        const screenshotUrl = `https://image.thum.io/get/width/1024/crop/768/${encodeURIComponent(url)}`;
        await bot.sendPhoto(chatId, screenshotUrl, {
            caption: `Скриншот сайта: ${url}`
        });
    } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при создании скриншота');
        console.error('Ошибка скриншота:', error.message);
    }
});

// ===== ТАЙМЕР: Проверка пользователей каждый день в 13:00 МСК =====
function checkInactiveUsers() {
    console.log(' Проверка неактивных пользователей...');
    
    const today = new Date();
    // Вычисляем дату 2 дня назад
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
    
    const sql = 'SELECT id FROM Users WHERE lastMessage <= ?';
    db.query(sql, [twoDaysAgoStr], (err, results) => {
        if (err) {
            console.error('Ошибка получения неактивных пользователей:', err);
            return;
        }
        
        if (results.length === 0) {
            console.log('Все пользователи активны!');
            return;
        }
        
        console.log(`Найдено ${results.length} неактивных пользователей`);
        
        // Отправляем randomItem каждому неактивному пользователю
        results.forEach((user) => {
            getRandomItem((itemText) => {
                bot.sendMessage(user.id, ` Привет! Вот случайный предмет для тебя:\n${itemText}`);
            });
        });
    });
}

// Функция для вычисления времени до следующего 13:00 МСК
function getNext13MSK() {
    const now = new Date();
    // МСК = UTC+3, значит 13:00 МСК = 10:00 UTC
    const next = new Date(now);
    next.setUTCHours(10, 0, 0, 0); // 10:00 UTC = 13:00 МСК
    
    // Если сегодня уже прошло 13:00 МСК - планируем на завтра
    if (now > next) {
        next.setUTCDate(next.getUTCDate() + 1);
    }
    
    return next;
}

// Запускаем первый запуск в 13:00 МСК
const firstRun = getNext13MSK();
const msUntilFirstRun = firstRun - new Date();
console.log(`Первая проверка будет в ${firstRun.toLocaleString()}`);

setTimeout(() => {
    // Первый запуск
    checkInactiveUsers();
    
    // Затем запускаем каждые 24 часа
    const timer = setIntervalAsync(checkInactiveUsers, 24 * 60 * 60 * 1000);
    console.log(' Таймер запущен (каждые 24 часа)');
}, msUntilFirstRun);

console.log('Бот запущен...');