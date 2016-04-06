(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['jquery'], function ($) {
            return root.Moduler = factory($);
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        root.Moduler = factory(root.jQuery);
    }
} (this, function ($) {
    var Moduler = {};

    Moduler.version = '0.4.0';
    Moduler.debug = true;

    Moduler.options = {
        logging: false,
        monitorDomChanges: true,
        moduleAttribute: 'data-module'
    };

    Moduler.initialize = function (options) {
        console.log('Moduler.initialize');

        // run Moduler.ready on document ready
        $(Moduler.ready);
    };

    Moduler.ready = function () {
        console.log('Moduler.ready');

        Moduler.registerModules().done(function () {
            $(document).trigger("modules-ready");
        });
        // Moduler.watchForModules();
    };

    Moduler.registerModules = function (containerElement) {
        console.log('Moduler.registerModules');

        var deferred = new $.Deferred(),
            moduleCount = 0,
            finishedLoading = 0;

        if (!containerElement) {
            containerElement = document;
        }
        
        // find elements with module attribute
        var $modules = $('[' + Moduler.options.moduleAttribute + ']', containerElement);

        $modules.each(function () {
            var moduleElement = $(this),
                moduleNames = moduleElement.attr(Moduler.options.moduleAttribute).split(' ');

            moduleCount += moduleNames.length - 1;

            for (var i in moduleNames) {
                var moduleName = moduleNames[i],
                    settingsAttr = moduleElement.attr('data-' + moduleName),
                    settings = Moduler.utils.parseSettings(settingsAttr),
                    modulePath = 'modules/' + moduleName;

                Moduler.initializeModule(modulePath, moduleName, settings, this)
                    .fail(function (reason) {
                        // Should we hard fail if a module crashes or swallow it?
                        Moduler.debug && console.warn(reason);

                        throw (new Error('Failed to load module: ' + moduleName));
                    })
                    .always(function () {
                        finishedLoading++;

                        if (finishedLoading === moduleCount) {
                            Moduler.debug && console.debug('All modules loaded');
                            
                            deferred.resolve('modules loaded');
                        }
                    });
            }
        });

        return deferred.promise();
    };

    Moduler.initializeModule = function (modulePath, moduleName, settings, moduleElement) {
        var deferred = new $.Deferred();

        require([modulePath], function (moduleObj) {
            if (typeof (settings) === "string") {
                deferred.reject('Settings attribute for module "' + moduleName + '" should be JSON-formated: data-' + moduleName + '=\'{ "property": "value" }\'. Current value ("' + settings + '") is not JSON.');
                return;
            }

            if (!moduleObj || !moduleObj.init) {
                deferred.reject('Failed to load module, missing init? ' + moduleName);
            }

            var $moduleElement = $(moduleElement);

            // skip if this module has no name or has already been initialized on this element
            if (!moduleName || $moduleElement.prop('_mo_' + moduleName)) {
                deferred.resolve(moduleName + ' already loaded');
                return;
            }
            
            // mark module as initialized
            $moduleElement.prop('_mo_' + moduleName, "initialized");

            Moduler.debug && console.debug('module "' + moduleName + '" initialized for ', moduleElement);

            var Module = function ($element, options, name) {
                this.el = $element[0];
                this.$el = $element;
                this.name = name;
                this.options = $.extend({}, this.defaults, options);
            };

            Module.prototype = moduleObj;

            var moduleInstance = new Module($moduleElement, settings, moduleName);
                        
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
    };
    
    Moduler.utils = {
        addModuleToElement: function (moduleElement, moduleName, settings, loadAfter) {
            if (typeof settings === "boolean") {
                loadAfter = settings;
                settings = null;
            }

            loadAfter = loadAfter === undefined ? true : loadAfter;

            var $element = $(moduleElement),
                modules = $element.attr('data-module');

            if (modules) {
                // module is already there
                if (modules.indexOf(moduleName) !== -1)
                    return;

                $element.attr('data-module', modules + ' ' + moduleName);
            } else {
                $element.attr('data-module', moduleName);
            }

            if (settings) {
                var attrModuleName = Moduler.utils.toHyphenCase(moduleName);
                $element.attr('data-' + attrModuleName, JSON.stringify(settings));
            }

            if (loadAfter) {
                Moduler.loadModules($element.parent());
            }
        },


        removeModuleFromElement: function (moduleElement, moduleName) {
            var module = Moduler.utils.getModule(moduleElement, moduleName);

            if (!module)
                return;
                
            // let module clean up event listeners
            if ('destroy' in module.obj && $.isFunction(module.obj.destroy)) {
                module.obj.destroy(module);
            }
                
            // remove any event listeners from listen object
            if ('listen' in module.obj) {
                $(moduleElement === doc.body ? doc : moduleElement).off(module.obj.listen);
            }

            // remove module prop
            module.$element.removeProp('_mo_' + moduleName);

            // remove settings attribute if found
            module.$element.removeAttr('data-' + mo.utils.toHyphenCase(moduleName));
            module.$element.removeData(moduleName);

            // remove module name from data-module attribute
            var modules = module.$element.attr('data-module');
            module.$element.attr('data-module', modules.replace(moduleName, ''));
        },

        settingsPropertyRegex: /([\w\-$]+):(?:|\s|\d|false|true|null|undefined|\{|\[|\"|\')/gi,
        settingsQuoteRegex: /'/g,

        parseSettings: function (value) {
            if (!value) {
                return null;
            }

            if (value[0] === '{') {  // is using JSON syntax
                return $.parseJSON(value);
            }

            value = value
                .replace(Moduler.utils.settingsPropertyRegex, '\"$1\":') // wrap all property names with quotes
                .replace(Moduler.utils.settingsQuoteRegex, '\"'); // replace single-quote character with double quotes

            return $.parseJSON('{' + value + '}');
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
        
        bindAll: function (obj) {
            var i,
                length = arguments.length,
                key;

            if (length <= 1) {
                throw new Error('bindAll must be passed function names');
            }

            for (i = 1; i < length; i++) {
                key = arguments[i];
                obj[key] = Function.bind(obj[key], obj);
            }

            return obj;
        },

        toHyphenCase: function (camelCaseString) {
            return camelCaseString.replace(/([A-Z])/g, function (letter) { return '-' + letter.toLowerCase(); });
        }
    }

    return Moduler;
}));