/**
 * getQueryParameters
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _           = require('lodash')
  , moment      = require('moment')
  , Ensure      = require('../../../../../tools/index').Ensure
  , operators   = require('../operators');

var filterLimit, serverTimezone;

//TODO Описать параметры и скорректировать наименование
/**
 *  Сворачивает фильтр в объект ключ-значение
 */
function _flattenFilter(obj, path, filter) {

    filter = filter || {};

    _.forOwn(obj, function (value, key) {
        var curPath = (path ? path + '.' : '') + key;

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            filter[curPath] = [ '=' + value ];

        } else if (value instanceof Array) {
            filter[curPath] = _.map(value, function (item) { return '=' + item; });

        } else if (value instanceof Date || moment.isMoment(value)) {
            var timeMoment = moment(value);

            if (serverTimezone) timeMoment.zone(serverTimezone);
            filter[curPath] = [ '=' + timeMoment(value).format('YYYYMMDDHHmmss') ];

        } else if (value.type === 'QueryOperatorResult' && value.filter) {
            filter[curPath] = value.filter;

        } else if (value instanceof Object) {
            var keys = _.keys(value);

            if (keys.length == 0)
                throw new TypeError('Empty key value [' + curPath + '] in filter object.');

            if (keys[0].substring(0, 1) == '$') {
                filter[curPath] = [];

                _.forEach(keys, function (key) {
                    var operator = operators[key];
                    if (typeof operator !== 'function')
                        throw new TypeError('Incorrect operator [' + key + '] in filter object [' + curPath + ']');

                    filter[curPath] = filter[curPath].concat(operator(value[key], serverTimezone).filter);
                }, this);

            } else {

                _flattenFilter(value, curPath, filter);
            }

        } else {
            throw new TypeError('Incorrect key value [' + curPath + '] in filter object.');
        }
    }, this);

    return filter;
}

function _splitFiltersAccordingLimit(filters) {
    var splitedFilters = [];

    _.forEach(filters, function (filter) {
        _.forOwn(filter, function (filterValues, filterKey) {
            if (filterValues.length > filterLimit) {
                var start = 0,
                    filterParts = [];

                while (start < filterValues.length) {
                    filterParts.push(filterValues.slice(start, start + filterLimit));
                    start += filterLimit;
                }

                _.forEach(filterParts, function (filterPart) {
                    var clonedFilter = _.clone(filter);
                    clonedFilter[filterKey] = filterPart;
                    splitedFilters.push(clonedFilter);
                });

                return false;
            }
        });
    });

    return splitedFilters.length > 0 ? _splitFiltersAccordingLimit(splitedFilters) : filters;
}


/**
 * Возвращает параметры для формирования строки запроса текущего Query
 * @returns {{}}
 */
var getQueryParameters = function (options) {
    //TODO Проверка входного значения
    filterLimit = options.filterLimit > 0 ? options.filterLimit : 50;
    serverTimezone = options.serverTimezone;

    var queryParams = this.getParameters(),
        queryParamsVariations = [],
        flattenedFilter,
        flattenedFilterVariations;

    flattenedFilter = _flattenFilter(this.getFilter());
    flattenedFilterVariations = _splitFiltersAccordingLimit([flattenedFilter]);

    _.forEach(flattenedFilterVariations, function (filter) {
        var filterItems = [];
        _.forOwn(filter, function (filterValues, filterKey) {
            _.forEach(filterValues, function (filterValue) {
                filterItems.push(filterKey + filterValue);
            })
        });

        var clonedParams = _.clone(queryParams);
        if (filterItems.length > 0) clonedParams.filter = filterItems.join(';');
        queryParamsVariations.push(clonedParams);
    });

    return queryParamsVariations;
};

module.exports = getQueryParameters;