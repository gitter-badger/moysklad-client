/**
 * Default Http request provider factory
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , callbackAdapter = require('./../../tools/callbackAdapter');

module.exports = function () {

    var XMLHttpRequest = this.getProvider('xmlhttprequest').XMLHttpRequest;

    return {
        fetch: function (options, callback) {

            var _options = {
                contentType: 'application/x-www-form-urlencoded',
                method: 'GET',
                async: false
            };
            _.extend(_options, options);

            var xhr = new XMLHttpRequest()
                , response
                , err;

            xhr.open(_options.method, _options.url, _options.async);
            xhr.setRequestHeader('Content-Type', _options.contentType);

            _.forOwn(_options.headers, function (value, key) {
                xhr.setRequestHeader(key, value);
            });

            //TODO Async: try only in sync mode!
            try {
                xhr.send(_options.payload);
            }
            catch (e) {
                err = {
                    code: 'XMLHttpRequest Error',
                    message: e
                };
            }

            if (!err) {
                var responceCode = xhr.status;
                response = {
                    headers: null,
                    contentText: xhr.responseText,
                    contentXml: xhr.responseXML,
                    //TODO Почему библиотека xmlhttprequest возвращает такой ответ? Это не по стандарту.
                    responseCode: (typeof responceCode === 'number') ? responceCode : parseInt(responceCode.split('\n')[0]),
                    responseCodeText: xhr.statusText
                };
            }

            var result = {
                response: response,
                request: _options,
                error: err //TODO Убрать?
            };

            return callbackAdapter(err, result, callback);
        }
    }
};