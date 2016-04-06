// AMD wrapper for moduler.js

define('vendor/moduler-0.4.1', [
  'jquery',
  'utils/pubsub',
  'underscore'
], function ($, pubsub, _) {
  'use strict';

  var mo = {
    version: '0.4.1',
    debug: false,
    
    init: function () {
      mo.detectNewModules();
      mo.loadModules().done(function () {
        pubsub.pub("controllers.ready");
      });
    },

    detectNewModules: function () {
      mo.utils.registerDomChangeEvents();

      $(document).on('domChanged', function (e, element) {
        mo.loadModules(element);
      });
    },

    loadModules: function (container) {
      var deferred = new $.Deferred();

      var moduleCount = 0;
      var finishLoading = 0;

      if (!container) {
        container = document;
      }

      mo.debug && console.group("init modules inside", container);
      var modules = $('[data-module]', container);
      moduleCount = modules.length;

      modules.each(function () {
        var moduleElement = $(this),
					moduleNames = moduleElement.attr('data-module').split(' ');
        
        moduleCount += moduleNames.length -1;

        for (var i in moduleNames) {
          var moduleName = moduleNames[i];
          

          //var module = mo.modules[moduleName],
          var settingsAttr = moduleElement.attr('data-' + moduleName),
						settings = mo.utils.parseSettings(settingsAttr),
						modulePath = 'modules/' + moduleName;

          mo.loadModule(modulePath, moduleName, settings, this)
            .fail(function (reason) {
              // Should we hard fail if a module crashes or swallow it?
              mo.debug && console.warn(reason);
              throw (new Error('Failed to load module: ' + moduleName));
            })
            .always(function () {
              finishLoading++;
              if (finishLoading === moduleCount) {
                mo.debug && console.debug('All modules loaded');
                deferred.resolve('modules loaded');
              }
            });
        }
      });
      mo.debug && console.groupEnd();
      return deferred.promise();
    },

    loadModule: function (modulePath, moduleName, settings, moduleElement) {
      var deferred = new $.Deferred();
      require([modulePath], function (moduleObj) {
        if (typeof (settings) === "string") {
          deferred.reject('Settings attribute for module "' + moduleName + '" should be JSON-formated: data-' + moduleName + '=\'{ "property": "value" }\'. Current value ("' + settings + '") is not JSON.');
          return;
        }

        if (!moduleObj || !moduleObj.init) {
          deferred.reject('Failed to load module, missing init? : ' + moduleName);
        }

        var $moduleElement = $(moduleElement);

        // skip if this module has no name or has already been initialized on this element
        if (!moduleName || $moduleElement.prop('_mo_' + moduleName)) {
          deferred.resolve(moduleName + ' already loaded');
          return;
        }
        // mark module as initialized
        $moduleElement.prop('_mo_' + moduleName, "initialized");

        mo.debug && console.debug('module "' + moduleName + '" initialized for ', moduleElement);

        var Module = function ($el, settings, name) {
          var self = this;
          self.$el = $el;
          self.$element = $el;
          self.name = name;
          self.settings = $.extend({}, self.defaults, settings);
          return self;
        };
        Module.prototype = moduleObj;
        var moduleInstance = new Module($moduleElement, settings, moduleName);
        var partialRight = function partialRight(fn /*, args...*/) {
          var slice = Array.prototype.slice;
          var args = slice.call(arguments, 1);
          return function () {
            return fn.apply(this, slice.call(arguments, 0).concat(args));
          };
        };
        $.each(_.functions(moduleInstance), function (i, item) {
          if (item.indexOf('__') === 0) {
            // do nothing
          }
          else if (item.indexOf('_') === 0) {
            // insert settings in last parameter
          
            if (moduleInstance[item].length > 1) {
              moduleInstance[item] = partialRight(moduleInstance[item], moduleInstance);
            }
          } else {
            _.bindAll(moduleInstance, item);
          }
        });
        // run init for module
        moduleInstance.init($moduleElement, moduleInstance.settings, deferred);

        if (moduleInstance.init.length < 3) {
          deferred.resolve(moduleName + ' loaded');
        }

      }, function (err) {
        deferred.reject('Failed to load modules: ' + err.requireModules.join(', '));
        throw (new Error('Failed to load modules: ' + err.requireModules.join(', ')));
      });
      return deferred.promise();
    },
  };

  mo.utils = (function () {
    return {
      

      toHyphenCase: function (camelCaseString) {
        return camelCaseString.replace(/([A-Z])/g, function (letter) { return '-' + letter.toLowerCase(); });
      },

      settingsPropertyRegex: /([\w\-$]+):(?:|\s|\d|false|true|null|undefined|\{|\[|\"|\')/gi,
      settingsQuoteRegex: /'/g,

      parseSettings: function (value) {
        if (!value) {
          return null;
        }
        
        if (value[0] === '{') {  // is using JSON syntax
          return jQuery.parseJSON(value);
        }

        value = value
					.replace(mo.utils.settingsPropertyRegex, '\"$1\":') // wrap all property names with quotes
					.replace(mo.utils.settingsQuoteRegex, '\"'); // replace single-quote character with double quotes

        return jQuery.parseJSON('{' + value + '}');
      },

      registerDomChangeEvents: function () {
        // jquery.domchanged.js: https://github.com/jproulx/jquery-domchanged-plugin/blob/master/jquery.domchanged.js

        function jQueryDOMChanged(element, type) {
          return $(element).trigger('domChanged', [element, type]);
        }

        function jQueryHook(method, caller) {
          var definition = $.fn[method];
          if (definition) {
            $.fn[method] = function () {
              var args = Array.prototype.slice.apply(arguments);
              var result = definition.apply(this, args);
              caller.apply(this, args);
              return result;
            };
          }
        }
        jQueryHook('prepend', function () {
          return jQueryDOMChanged(this, 'prepend');
        });
        jQueryHook('append', function () {
          return jQueryDOMChanged(this, 'append');
        });
        jQueryHook('before', function () {
          return jQueryDOMChanged($(this).parent(), 'before');
        });
        jQueryHook('after', function () {
          return jQueryDOMChanged($(this).parent(), 'after');
        });
        jQueryHook('html', function (value) {
          // Internally jQuery will set strings using innerHTML
          // otherwise will use append to insert new elements
          // Only trigger on string types to avoid doubled events
          if (typeof value === 'string') {
            return jQueryDOMChanged(this, 'html');
          }
        });
      },

    };
  })();

  return mo;

});