(function () {
    "use strict";

    var loader = moduler('loader', {
        defaults: {
            url: '',
            contentElement: '',
            event: 'click',
            once: true,
            loadOnInit: false
        },
        
        init: function (module) {
            var settings = module.settings;

            if (settings.event) {
                module.$element.on(settings.event + '.loader', mo.data(module), loader.listen.sendRequest);
            }

            if (settings.loadOnInit) {
                loader.listen.sendRequest(module);
            }
        },
        
        listen: {
            sendRequest: mo.event(function(module) {
                var settings = module.settings,
                    element = module.$element;

                if (settings.once && module.isLoaded)
                    return;

                element.addClass('loading');

                $.ajax({
                    url: settings.url
                }).always(function () {
                    element.removeClass('loading');
                    
                    // trigger the module prefixed event that other modules can use it.
                    element.trigger('loader.' + settings.event);
                }).done(function (response) {
                    $(settings.contentElement).html(response);

                    module.isLoaded = true;
                    element.trigger('loaded');
                });

                if (settings.once && settings.event) {
                    $(this).off(settings.event + '.loader').on(settings.event + '.loader', function () {
                        element.trigger('loader.' + settings.event);
                    });
                }
            })
        }
    });
})();