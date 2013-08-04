/*global console, jQuery */

(function (win, doc, $) {
    "use strict";

    var mo = {
        init: function () {
            mo.loadModules();
            mo.registerOnDomChangeEvents();
            mo.autoDetectNewModules();
        },

        modules: {
            register: function (moduleName, moduleObj) {
                if (moduleName === 'register') {
                    throw new Error('cannot add a module named \'register\'.');
                }

                var obj = {};
                obj[moduleName] = moduleObj;
                $.extend(mo.modules, obj);
                
                return moduleObj;
            }
        },

        loadModules: function (container) {
            if (container == null) {
                container = document;
            }

            //console.groupCollapsed("init modules inside", container);
            console.group("init modules inside", container);

            $('[data-module]', container).each(function () {
                var moduleElement = $(this),
                    moduleName = moduleElement.data('module'),
                    module = mo.modules[moduleName],
                    settings = moduleElement.data(moduleName),
                    hasMultipleModules = moduleName.indexOf(' ') != -1;

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

            console.groupEnd();

        },

        loadModule: function (moduleName, moduleElement, moduleObj, settings) {
            if (typeof (settings) == "string")
                throw new Error('Settings attribute for module "' + moduleName + '" should be JSON-formated: data-' + moduleName + '=\'{ "property": "value" }\'. Current value ("' + settings + '") is not JSON.');

            // skip if this module has already been initialized on this element
            if ($(moduleElement).prop('_mo_' + moduleName)) {
                return;
            }

            if (moduleObj && moduleObj.init) {
                console.debug('module "' + moduleName + '" initialized for ', moduleElement);

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
                    $(moduleElement == doc.body ? doc : moduleElement).on(moduleObj.listen, mo.data(moduleState));
                }
                
                moduleObj.init.call(moduleElement, moduleState);
                $moduleElement.prop('_mo_' + moduleName, moduleState);
            } else {
                console.warn('module "' + moduleName + '" does not exist, or does not have an init method.');
            }
        },

        registerOnDomChangeEvents: function () {
            var domModificationMethods = ['remove', 'empty', 'before', 'after', 'append', 'appendTo', 'insertBefore', 'insertAfter', 'prepend', 'prependTo', 'html'],
                domChangeEventName = 'domChange';

            $.each(domModificationMethods, function (i, method) {
                var originalFn = $.fn[method];

                $.fn[method] = function () {
                    var element = this;

                    if (method === 'html') {
                        $(element).trigger(method).trigger(domChangeEventName, [element, method]);
                        return originalFn.apply(element, arguments);
                    } else {
                        return originalFn.apply(element, arguments).trigger(method).trigger(domChangeEventName, [element, method]);
                    }
                };
            });
        },

        autoDetectNewModules: function () {
            $(document).on('domChange', function (e, element, method) {
                if (method == "remove" || method == "empty") {
                    return;
                }

                setTimeout(function () {
                    mo.loadModules(element);
                }, 0);
            });
        }
    };

    win.mo = mo;
    win.moduler = mo.modules.register.bind(mo);
    
    mo.event = function (func) {
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
    };

    mo.data = function (moduleState) {
        return {
            moduleState: moduleState,
        };
    };

    mo.getState = function (moduleElement, moduleName) {
        return $(moduleElement).prop('_mo_' + moduleName);
    };
    
    mo.getSettings = function (moduleElement, moduleName) {
        return mo.getState(moduleElement, moduleName).settings;
    };

    mo.addModuleToElement = function (moduleElement, moduleName, settings, loadAfter) {
        if (typeof settings == "boolean") {
            loadAfter = settings;
            settings = null;
        }
        
        loadAfter = loadAfter == null ?  true : loadAfter;
        
        var $element = $(moduleElement);
        var modules = $element.attr('data-module');

        if (modules) {
            // module is already there
            if (modules.indexOf(moduleName) != -1)
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
    };
    
    $(mo.init);

    // suppress console.log errors in unsupported browsers
    if (!(window.console && console.log && console.groupCollapsed)) {
        (function () {
            var d = function () { };
            var b = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"];
            var c = b.length;
            var a = window.console = {};
            while (c--) {
                a[b[c]] = d;
            }
        }());
    };
    

})(window, document, jQuery);


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