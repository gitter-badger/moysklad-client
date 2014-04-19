/**
 * Logger (node.js context)
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

//TODO Изменить шаблоны вывода лога и добавить цвет

// https://github.com/baryon/tracer

//var colors = require('colors');

var logger = require('tracer').console({
    format: [
        "{{timestamp}} <{{title}}> {{message}} ({{method}} in {{file}}:{{line}})" //default format
    ],
    dateformat: "HH:MM:ss",
    preprocess: function (data) {
        data.title = data.title.toUpperCase();
    }
});

logger.time = function (name) {
    console.time(name);
};

logger.timeEnd = function (name) {
    console.timeEnd(name);
};

module.exports = function () {
    return logger;
};