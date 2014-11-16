(function (win, doc, $) {
    "use strict";

    var mo = {
        version: '0.3.0',
        debug: false,

        // list of all registered module types
        modules: {},
        
        init: function() {
            mo.detectNewModules();
            mo.loadModules();
        },
        
        detectNewModules: function () {
            mo.utils.registerDomChangeEvents();
            
            $(document).on('domChanged', function (e, element) {
                mo.loadModules(element);
            });
        },
        
        module: function (moduleName, moduleObj) {
            var obj = {};
            obj[moduleName] = moduleObj;
            $.extend(mo.modules, obj);
            return moduleObj;
        },
        
        loadModules: function (container) {
            if (!container) {
                container = document;
            }

            mo.debug && console.group("init modules inside", container);

            $('[data-module]', container).each(function () {
                var moduleElement = $(this),
                    moduleNames = moduleElement.attr('data-module').split(' ');

                for (var i in moduleNames) {
                    var moduleName = moduleNames[i],
                        initEvent = null;

                    if (moduleName.indexOf(':') > -1) {
                        var parts = moduleName.split(':');
                        moduleName = parts[0];
                        initEvent = parts[1];
                    }

                    var module = mo.modules[moduleName],
                        settingsAttr = moduleElement.attr('data-' + moduleName),
                        settings = mo.utils.parseSettings(settingsAttr);

                    mo.loadModule(moduleName, this, module, settings, initEvent);
                }
            });

            mo.debug && console.groupEnd();
        },
        
        loadModule: function (moduleName, moduleElement, moduleObj, settings, initEvent) {
            if (typeof (settings) === "string")
                throw new Error('Settings attribute for module "' + moduleName + '" should be JSON-formated: data-' + moduleName + '=\'{ "property": "value" }\'. Current value ("' + settings + '") is not JSON.');

            var $moduleElement = $(moduleElement);

            // skip if this module has no name or has already been initialized on this element
            if (!moduleName || $moduleElement.prop('_mo_' + moduleName)) {
                return;
            }

            if (moduleObj && moduleObj.init) {
                mo.debug && console.debug('module "' + moduleName + '" initialized for ', moduleElement);

                if ('defaults' in moduleObj) {
                    settings = $.extend({}, moduleObj.defaults, settings);
                }

                var moduleState = {
                    name: moduleName,
                    element: moduleElement,
                    $element: $moduleElement,
                    settings: settings || {},
                    obj: moduleObj
                };

                if ('listen' in moduleObj) {
                    $(moduleElement === doc.body ? doc : moduleElement).on(moduleObj.listen, moduleState);
                }

                // set the state before calling init to prevent stack overflow if init moves the $element.
                $moduleElement.prop('_mo_' + moduleName, moduleState);

                // wait for initEvent to trigger instead of running init() immediately
                if (initEvent) {
                    $moduleElement.one(initEvent, function () {
                        moduleObj.init.call(moduleElement, moduleState);                    
                    });
                } else {
                    moduleObj.init.call(moduleElement, moduleState);
                }
            } else {
                mo.debug && console.warn('module "' + moduleName + '" does not exist, or does not have an init method.');
            }
        },
        
        event: function (func) {
            return function (event) {
                if (!(event instanceof jQuery.Event) || !event.data) {
                    var context = this;

                    // parameter is moduleState object
                    if ('element' in event) {
                        context = event.element;
                    }
                    
                    func.apply(context, arguments);
                    return;
                }

                var moduleState = event.data,
                    args = [].slice.call(arguments),
                    params = [moduleState].concat(args);

                func.apply(moduleState.element, params);
            };
        }
    };

    mo.utils = (function () {
        return {
            getModule: function (moduleElement, moduleName) {
                return $(moduleElement).prop('_mo_' + moduleName);
            },
            
            getSettings: function (moduleElement, moduleName) {
                var module = mo.utils.getModule(moduleElement, moduleName);
                return module.settings;
            },
            
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
                    var attrModuleName = mo.utils.toHyphenCase(moduleName);
                    $element.attr('data-' + attrModuleName, JSON.stringify(settings));
                }

                if (loadAfter) {
                    mo.loadModules($element.parent());
                }
            },

            removeModuleFromElement: function (moduleElement, moduleName) {
                var module = mo.utils.getModule(moduleElement, moduleName);
                
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

            toHyphenCase: function(camelCaseString) {
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

            loadedScripts: {}, // container for scripts that have been added to the document

            loadScript: function loadScript(url, condition) {
                var dfd = $.Deferred();

                // "condition()" returns true if the necessary objects are loaded.
                if (condition && condition()) {
                    dfd.resolve();
                    return dfd;
                }

                var originalUrl = url;

                if (mo.utils.loadedScripts[originalUrl]) {
                    return mo.utils.loadedScripts[originalUrl];
                }

                var script = document.createElement('script');
                script.type = 'text/javascript';

                // script will call a callback when it's loaded and ready.
                if (url.indexOf('{callback}') > -1) {
                    var callbackName = 'callback' + Math.random().toString().replace('.', '');
                    url = url.replace('{callback}', callbackName);

                    window[callbackName] = function () {
                        dfd.resolve();

                        try {
                            delete window[callbackName]; 
                        } catch (e) {
                            window[callbackName] = undefined; // IE8 doesn't support "delete"
                        }
                    };
                } else {
                    if (script.readyState) {  // IE
                        script.onreadystatechange = function() {
                            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                                script.onreadystatechange = null;
                                dfd.resolve();
                            }
                        };
                    } else {  // Others
                        script.onload = function() {
                            dfd.resolve();
                        };
                    }
                }

                mo.utils.loadedScripts[originalUrl] = dfd;
                script.src = url;
                document.body.appendChild(script);

                return dfd.promise();
            }
        };
    })();
    
    // run mo.init at dom load
    $(mo.init);

    win.mo = mo;
    win.moduler = mo.module;
    
})(window, document, jQuery);