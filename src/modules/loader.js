(function () {
    "use strict";

    var loader = moduler('loader', {
        defaults: {
            url: '',
            contentElement: null,
            event: 'click',
            once: true,
            responseModule: null,
            loadOnInit: false,
            loadingCssClass: 'loading',
            insertMode: 'replace', /* replace|append */
        },
        
        init: function (module) {
            var settings = module.settings;

            if (settings.event) {
                module.$element.on(settings.event + '.loader', module, loader.listen.sendRequest);
            }

            if (settings.loadOnInit) {
                loader.listen.sendRequest(module);
            }
        },
        
        listen: {
            sendRequest: mo.event(function(module) {
                var settings = module.settings,
                    element = module.$element,
                    $contentElement = module.settings.contentElement !== null ? $(module.settings.contentElement) : module.$element;

                if (settings.once && module.isLoaded)
                    return;

                element.addClass(settings.loadingCssClass);

                $.ajax({
                    url: settings.url
                }).always(function () {
                    element.removeClass(settings.loadingCssClass);
                    
                    // trigger the module prefixed event that other modules can use it.
                    element.trigger('loader-' + settings.event);
                }).done(function (response, status, xhr) {
                    if (module.settings.responseModule) {
                        mo.utils.removeModuleFromElement($contentElement, module.settings.responseModule);
                        mo.utils.addModuleToElement($contentElement, module.settings.responseModule, { response: response });
                    } else if ($contentElement.length && xhr.getResponseHeader('content-type').indexOf('text/html') !== -1) {
                        if (module.settings.insertMode == 'replace') {
                            $contentElement.html(response);
                        } else if (module.settings.insertMode == 'append') {
                            $contentElement.append(response);
                        }
                    }

                    module.isLoaded = true;
                    element.trigger('loader-done', { response: response });
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