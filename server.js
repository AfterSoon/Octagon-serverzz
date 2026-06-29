const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ChatBotTests',
    
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
        return;
    }
    console.log('Подключено к базе данных ChatBotTests');
});

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

// Получить все элементы
app.get('/getAllItems', (req, res) => {
    console.log('GET /getAllItems');
    const sql = 'SELECT * FROM Items';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка SELECT:', err.message);
            return res.json(null);
        }
        console.log('Найдено записей:', results.length);
        res.json(results);
    });
});

// Добавить элемент
app.post('/addItem', (req, res) => {
    console.log('POST /addItem');
    const { name, desc } = req.query;
    
    console.log('Получены данные:', { name, desc });
    
    if (!name || !desc) {
        console.log('Нет name или desc');
        return res.json(null);
    }
    
    const sql = 'INSERT INTO Items (name, `desc`) VALUES (?, ?)';
    db.query(sql, [name, desc], (err, result) => {
        if (err) {
            console.error('Ошибка INSERT:', err.message);
            return res.json(null);
        }
        console.log('Успешно добавлено:', result.insertId);
        res.json({ id: result.insertId, name, desc });
    });
});

// Удалить элемент
app.post('/deleteItem', (req, res) => {
    console.log('POST /deleteItem');
    const { id } = req.query;
    
    console.log('Получен id:', id);
    
    if (!id || isNaN(id)) {
        console.log('Неверный id');
        return res.json(null);
    }
    
    const sql = 'DELETE FROM Items WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Ошибка DELETE:', err.message);
            return res.json(null);
        }
        if (result.affectedRows === 0) {
            console.log('Элемент не найден');
            return res.json({});
        }
        console.log('Удалено записей:', result.affectedRows);
        res.json({ success: true });
    });
});

// Обновить элемент
app.post('/updateItem', (req, res) => {
    console.log('POST /updateItem');
    const { id, name, desc } = req.query;
    
    console.log('Получены данные:', { id, name, desc });
    
    if (!id || !name || !desc || isNaN(id)) {
        console.log('Неверные параметры');
        return res.json(null);
    }
    
    const sql = 'UPDATE Items SET name = ?, `desc` = ? WHERE id = ?';
    db.query(sql, [name, desc, id], (err, result) => {
        if (err) {
            console.error('Ошибка UPDATE:', err.message);
            return res.json(null);
        }
        if (result.affectedRows === 0) {
            console.log('Элемент не найден');
            return res.json({});
        }
        console.log('Обновлено записей:', result.affectedRows);
        res.json({ id: parseInt(id), name, desc });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/`);
});