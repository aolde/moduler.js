(function () {
    "use strict";

    var moduleObj = moduler('poster', {
        defaults: {
            url: null,
            event: 'click',
            data: undefined,
            once: false,
            contentElement: null,
            responseModule: null,
            httpMethod: 'POST',
            loadingCssClass: 'loading'
        },
        
        init: function (module) {
            var bindMethod = module.settings.once ? "one" : "on";
            module.$element[bindMethod](module.settings.event, module, moduleObj.listen.fireRequest);
        },

        listen: {
            fireRequest: mo.event(function (module, e) {
                var settings = module.settings,
                    $contentElement = settings.contentElement !== null ? $(settings.contentElement) : module.$element;

                e.preventDefault();
                module.$element.addClass(settings.loadingCssClass);

                // send request
                $.ajax({
                    type: settings.httpMethod,
                    url: settings.url,
                    data: settings.data ? settings.data : {}
                }).always(function () {
                    module.$element.removeClass(settings.loadingCssClass);
                }).done(function (response, status, xhr) {
                    if (settings.responseModule) {
                        mo.utils.removeModuleFromElement($contentElement, settings.responseModule);
                        mo.utils.addModuleToElement($contentElement, settings.responseModule, { response: response });
                    } else if ($contentElement.length && xhr.getResponseHeader('content-type').indexOf('text/html') !== -1) {
                        $contentElement.html(response);
                    }

                    module.$element.trigger('poster-done', { response: response });
                }).error(function () {
                    module.$element.trigger('poster-error');
                });
    
            })
        },

        destroy: function (module) {
            module.$element.off(module.settings.event, moduleObj.listen.fireRequest);
        }
    });
    
})();