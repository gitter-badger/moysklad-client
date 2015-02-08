/**
 * Client
 * Date: 25.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _                         = require('lodash')
  , stampit                   = require('stampit')
  , operators                 = require('./../rest-clients/ms-xml/query/operators')
  , authProviderBehavior      = require('./../../authProviderBehavior')
  , providerAccessorBehavior  = require('./../../providerAccessorBehavior')
  , optionsAccessBehavior     = require('./../../optionsAccessBehavior')
  , clientProperties          = require('./client-properties');

/**
 * @lends Client.prototype
 */
var clientMethods = {
    // Ms
    from    : require('./methods/from'),
    load    : require('./methods/load'),
    chain   : require('./methods/chain'),
    first   : require('./methods/first'),
    total   : require('./methods/total'),
    save    : require('./methods/save'),
    del     : require('./methods/del'),

    // LazyLoader
    createLazyLoader: require('./lazy-loader')
};

var jsonServiceMethods = require('./methods/json-service');

/**
 * @class Client
 */
var Client = stampit()

    // Options
    .enclose(optionsAccessBehavior)
    .enclose(function () {
        this.set(clientProperties);
    })
    // Auth
    .enclose(authProviderBehavior)
    // Providers accessor
    .enclose(providerAccessorBehavior)

    // Methods
    //
    .methods(clientMethods)
    .methods(jsonServiceMethods)
    .methods(operators);

module.exports = Client;