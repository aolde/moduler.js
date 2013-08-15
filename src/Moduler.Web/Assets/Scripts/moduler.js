/* global console, jQuery */

(function (win, doc, $) {
    "use strict";

    var mo = {
        version: '1.0.0',
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
            if (container == null) {
                container = document;
            }

            mo.debug && console.group("init modules inside", container);

            $('[data-module]', container).each(function () {
                var moduleElement = $(this),
                    moduleName = moduleElement.data('module'),
                    module = mo.modules[moduleName],
                    settings = moduleElement.data(moduleName),
                    hasMultipleModules = moduleName.indexOf(' ') !== -1;

                if (hasMultipleModules) {
                    var moduleNames = moduleName.split(' ');

                    for (var i in moduleNames) {
                        moduleName = moduleNames[i];

                        module = mo.modules[moduleName];
                        settings = moduleElement.data(moduleName);

                        mo.loadModule(moduleName, this, module, settings);
                    }
                } else {
                    mo.loadModule(moduleName, this, module, settings);
                }
            });

            mo.debug && console.groupEnd();
        },
        
        loadModule: function (moduleName, moduleElement, moduleObj, settings) {
            if (typeof (settings) === "string")
                throw new Error('Settings attribute for module "' + moduleName + '" should be JSON-formated: data-' + moduleName + '=\'{ "property": "value" }\'. Current value ("' + settings + '") is not JSON.');

            // skip if this module has already been initialized on this element
            if ($(moduleElement).prop('_mo_' + moduleName)) {
                return;
            }

            if (moduleObj && moduleObj.init) {
                mo.debug && console.debug('module "' + moduleName + '" initialized for ', moduleElement);

                if ('defaults' in moduleObj) {
                    settings = $.extend({}, moduleObj.defaults, settings);
                }

                var $moduleElement = $(moduleElement),
                    moduleState = {
                        name: moduleName,
                        element: moduleElement,
                        $element: $moduleElement,
                        settings: settings || {},
                        obj: moduleObj
                    };

                if ('listen' in moduleObj) {
                    $(moduleElement === doc.body ? doc : moduleElement).on(moduleObj.listen, mo.data(moduleState));
                }

                moduleObj.init.call(moduleElement, moduleState);
                $moduleElement.prop('_mo_' + moduleName, moduleState);
            } else {
                mo.debug && console.warn('module "' + moduleName + '" does not exist, or does not have an init method.');
            }
        },
        
        event: function (func) {
            return function (event) {
                if (!(event instanceof jQuery.Event) || !event.data) {
                    var context = this;
                    if ('element' in event) {
                        context = event.element;
                    }
                    func.apply(context, arguments);
                    return;
                }

                var moduleState = event.data.moduleState,
                    args = [].slice.call(arguments),
                    params = [moduleState].concat(args);

                func.apply(moduleState.element, params);
            };
        },
        
        data: function (moduleState) {
            return {
                moduleState: moduleState
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

                loadAfter = loadAfter == null ? true : loadAfter;

                var $element = $(moduleElement);
                var modules = $element.attr('data-module');

                if (modules) {
                    // module is already there
                    if (modules.indexOf(moduleName) !== -1)
                        return;

                    $element.attr('data-module', modules + ' ' + moduleName);
                } else {
                    $element.attr('data-module', moduleName);
                }

                if (settings) {
                    $element.attr('data-' + moduleName, JSON.stringify(settings));
                }

                if (loadAfter) {
                    mo.loadModules($element.parent());
                }
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
            }
        };
    })();
    
    $(mo.init);

    win.mo = mo;
    win.moduler = mo.module.bind(mo);
    
})(window, document, jQuery);



//// suppress console.log errors in unsupported browsers
//if (!(window.console && console.log && console.groupCollapsed)) {
//    (function () {
//        var d = function () { };
//        var b = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"];
//        var c = b.length;
//        var a = window.console = {};
//        while (c--) {
//            a[b[c]] = d;
//        }
//    }());
//};


//if (!Function.prototype.bind) {
//    Function.prototype.bind = function (oThis) {
//        if (typeof this !== "function") {
//            // closest thing possible to the ECMAScript 5 internal IsCallable function
//            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
//        }

//        var aArgs = Array.prototype.slice.call(arguments, 1),
//            fToBind = this,
//            fNOP = function () { },
//            fBound = function () {
//                return fToBind.apply(this instanceof fNOP && oThis
//                                       ? this
//                                       : oThis,
//                                     aArgs.concat(Array.prototype.slice.call(arguments)));
//            };

//        fNOP.prototype = this.prototype;
//        fBound.prototype = new fNOP();

//        return fBound;
//    };
//}