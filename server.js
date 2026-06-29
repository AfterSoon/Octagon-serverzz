const express = require('express');
const app = express();
const PORT = 3000;

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

// Маршрут /static - возвращает JSON
app.get('/static', (req, res) => {
    res.json({
        header: "Hello",
        body: "Octagon NodeJS Test"
    });
});

// Маршрут /dynamic - вычисляет (a*b*c)/3
app.get('/dynamic', (req, res) => {
    const a = req.query.a;
    const b = req.query.b;
    const c = req.query.c;

    // Проверяем, что все переменные получены и являются числами
    if (a === undefined || b === undefined || c === undefined ||
        isNaN(a) || isNaN(b) || isNaN(c)) {
        return res.json({
            header: "Error"
        });
    }

    const result = (a * b * c) / 3;

    res.json({
        header: "Calculated",
        body: result
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/`);
});