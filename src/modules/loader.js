(function () {
    "use strict";

    var moduleObj = moduler('loader', {
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
            
            module.$contentElement = module.settings.contentElement !== null ? $(module.settings.contentElement) : module.$element;

            if (settings.event) {
                module.$element.on(settings.event + '.loader', module, moduleObj.listen.sendRequest);
            }

            if (settings.loadOnInit) {
                moduleObj.listen.sendRequest(module);
            }
        },

        updateElementContent: function (html, module) {
            if (module.settings.insertMode == 'replace') {
                module.$contentElement.html(html);
            } else if (module.settings.insertMode == 'append') {
                module.$contentElement.append(html);
            }
        },
        
        listen: {
            sendRequest: mo.event(function(module) {
                var settings = module.settings,
                    element = module.$element,
                    $contentElement = module.$contentElement;

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
                    } else if (xhr.getResponseHeader('content-type').indexOf('text/html') !== -1) {
                        moduleObj.updateElementContent(response, module);
                    }

                    module.isLoaded = true;
                    element.trigger('loader-done', { response: response });
                }).error(function(response) {
                    if (!module.settings.responseModule) {
                        moduleObj.updateElementContent(response, module);
                    }

                    element.trigger('loader-error', { response: response });
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