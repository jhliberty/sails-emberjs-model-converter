/**
 * Converts Sails.js models to ember.js models
 * usually used to create models of the files ember.js
 *
 * TODO add suport to convert to one object
 */

var converter = {},
  templates = require('./templates.js');
converter.templates = templates;

/**
 * Convert one sails model to ember.js model string for send to user browser for save in one file
 *
 * @param  {string} modelName  model name ex.: user, post ...
 * @param  {object} sailsModel sails.js model from sails.models[model]
 * @param  {string} appName    optional app name
 * @return {string}            model string for send to user browser
 */
converter.convertToEmberJSFile = function convertToEmberJSFile (modelName, sailsModel, appName) {

  // skip join table
  if (sailsModel.meta && sailsModel.meta.junctionTable) {
    return;
  }

  // appName is a optional param
  if (!appName) appName = 'App';

  // skip if dont have

  if (!sailsModel.definition || !sailsModel.associations) return;

  var attrs = [],
    attrNames = Object.keys(sailsModel.definition);

  attrNames.forEach(function (attrName) {
    // skip id attr
    if (attrName !== 'id') {
      var attr = sailsModel.definition[attrName],
        attrData = {};

      attrData.name = attrName;
      attrData.defaultValue = attr.defaultsTo;

      // if is a bellongsTo
      if (attr.model) {
        attrData.relationName = attr.model;
        attrs.push(templates.attrs.belongsTo(attrData));
      } else {
      // if is a data attr
        switch (attr.type) {
          case 'date':
            attrs.push(templates.attrs.date(attrData));
            break;
          case 'array':
            attrs.push(templates.attrs.clean(attrData));
            break;
          case 'datetime':
            attrs.push(templates.attrs.date(attrData));
            break;
          case 'integer':
            attrs.push(templates.attrs.number(attrData));
            break;
          case 'boolean':
            attrs.push(templates.attrs.boolean(attrData));
            break;
          default:
            attrs.push(templates.attrs.string(attrData));
        }
      }
    }
  });

  // search for hasMany associations
  sailsModel.associations.forEach(function (attr) {

    // has many associations
    if (attr.type === 'collection') {
      var attrData = {};
      attrData.name = attr.alias;
      attrData.relationName = attr.collection;
      attrData.inverse = attr.via;

      // TODO allow async config
      attrData.async = true;

      attrs.push(templates.attrs.hasMany(attrData));
    }
  });

  return templates.model({
    appName: appName,
    modelName: modelName,
    attrs: attrs.join()
  });
}

/**
 * Convert multiple sails.js models to one ember.js models file
 *
 * @param  {object} sailsModels sails.js models usually something like sails.models
 * @return {string}             models file for sent to user browser or save in one file
 */
converter.convertMultipleToEmberJSFile = function convertMultipleToEmberJSFile (sailsModels) {
  var emberModels = '',
    modelNames = Object.keys(sailsModels);

  modelNames.forEach(function (modelName) {
    var emberModel = converter.convertToEmberJSFile(modelName, sailsModels[modelName]);
    if (emberModel) {
      emberModels+= emberModel;
    }
  })

  return emberModels;
}

module.exports = converter;
