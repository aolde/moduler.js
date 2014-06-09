(function ($) {
    "use strict";

    var moduleObj = moduler('toggler', {
        defaults: {
            event: 'click',
            contentElement: null,
            cssClass: 'hide',
            preventDefault: true,
            once: false
        },

        init: function (module) {
            module.$contentElement = $(module.settings.contentElement ? module.settings.contentElement : module.element);
            module.$element.on(module.settings.event, module, moduleObj.listen.toggleVisibility);
        },

        listen: {
            show: mo.event(function (module) {
                module.$contentElement.removeClass(module.settings.cssClass);
                module.$contentElement.trigger('toggler-shown');
            }),

            hide: mo.event(function (module) {
                module.$contentElement.addClass(module.settings.cssClass);
                module.$contentElement.trigger('toggler-hidden');
            }),

            toggleVisibility: mo.event(function (module, e) {
                if (module.settings.preventDefault) {
                    e.preventDefault();
                }

                if (module.settings.once && module.toggled) {
                    return;
                } else if (module.settings.once) {
                    module.toggled = true;
                }

                module.$contentElement.toggleClass(module.settings.cssClass);
                module.$contentElement.trigger('toggler-toggeled');
            })
        }
    });

})(jQuery);