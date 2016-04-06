(function ($) {
    "use strict";

    var moduleObj = moduler('menu', {
        defaults: {
            event: 'click',
            contentElement: null,
            cssClass: 'is-active',
            preventDefault: true,
            once: false
        },

        init: function (module) {
            module.$element.on(module.settings.event, module, moduleObj.listen.toggleVisibility);
            module.$contentElement = $(module.settings.contentElement ? module.settings.contentElement : module.element);
            module.$contentElement.on('click', function(e) {
                e.stopPropagation();
            });
            $('html').on('click', function () {
                moduleObj.listen.hide(module);
            });
        },

        listen: {
            show: mo.event(function (module) {
                module.$contentElement.addClass(module.settings.cssClass);
                module.$contentElement.trigger('menu-shown');
            }),

            hide: mo.event(function (module) {
                module.$contentElement.removeClass(module.settings.cssClass);
                module.$contentElement.trigger('menu-hidden');
            }),

            toggleVisibility: mo.event(function (module, e) {
                if (module.settings.preventDefault) {
                    e.preventDefault();
                }

                e.stopPropagation();

                if (module.settings.once && module.toggled) {
                    return;
                } else if (module.settings.once) {
                    module.toggled = true;
                }

                module.$contentElement.toggleClass(module.settings.cssClass);
                module.$contentElement.trigger('menu-toggled');
            })
        }
    });

})(jQuery);