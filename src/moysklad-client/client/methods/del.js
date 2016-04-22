/**
 * del
 * Date: 10.02.15
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _               = require('lodash'), 
    callbackAdapter = require('project/callbackAdapter');

//TODO Ограничение на кол-во удаляемых объектов в коллекции (проверить)

/**
 * Del. Удаляет сущность или список сущностей.
 *
 * @param {String} [type] Тип сущности (если не указан производится попытка получить тип из свойства объекта TYPE_NAME)
 * @param {Object} ent Сущность или список сущностей
 * @param {Function=} callback
 * @returns {Object} Созданная/сохраненная сущность
 */
var del = function () {
    //TODO Ensure
    var that     = this,
        args     = _.toArray(arguments), 
        callback = typeof args.slice(-1)[0] === 'function' ? args.slice(-1)[0] : null;

    var restClient  = this.getProvider('ms-xml'),
        obj = null;

    var putArgs = args.slice(0, args.length);

    putArgs.push(function (err, data) {
        obj = callbackAdapter(err, data.obj, callback, that.options.flowControl);
    });

    restClient.del.apply(restClient, putArgs);

    return obj;
};

module.exports = del;