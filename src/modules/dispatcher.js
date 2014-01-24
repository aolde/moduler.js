(function () {
    "use strict";

    var moduleObj = moduler('dispatcher', {
        defaults: {
            listenEvent: 'click', // the event to listen for. (required)
            listenSelector: null, // selector for elements to listen for the event (optional)

            triggerEvent: '', // event name to trigger when listenEvent fires. (required)
            triggerSelector: null, // selector for elements to trigger the event. (optional)
            triggerContext: null, // the context in which it will try to find elements through triggerSelector. (optional)

            preventDefault: true // whether to preventDefault when event fires.
        },
        
        init: function (module) {
            var settings = module.settings;

            module.$element.on(settings.listenEvent, settings.listenSelector, module, moduleObj.eventFired);
        },

        eventFired: mo.event(function (module, e) {
            var settings = module.settings;

            if (settings.preventDefault) {
                e.preventDefault();
            }

            if (settings.triggerSelector) {
                var $container = moduleObj.getContext(module);
                $container.find(settings.triggerSelector).trigger(settings.triggerEvent);
            } else {
                module.$element.trigger(settings.triggerEvent);
            }
        }),

        getContext: function (module) {
            var triggerContext = module.settings.triggerContext;
            
            if (triggerContext) {
                if (triggerContext == 'parent') {
                    return module.$element.parent(); 
                }
                return $(triggerContext);
            }
            return module.$element;
        },
        
        destroy: function (module) { 
            module.$element.off(settings.listenEvent, moduleObj.eventFired);
        }
    });
    
})();