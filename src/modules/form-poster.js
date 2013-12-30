(function($) {
    "use strict";

    var moduleObj = moduler('form-poster', {
        defaults: {
            submitButton: 'input[type=submit], button[type=submit]',
            url: null, // override the form's url. in case you want different url for ajax requests.
            event: 'submit',
            contentElement: null,
            responseModule: null,
            loadingCssClass: 'form-loading'
        },

        init: function(module) {
            var $form = module.$element.is('form') ? module.$element : module.$element.find('form'),
                $submitButton = $form.find(module.settings.submitButton),
                $contentElement = module.settings.contentElement !== null ? $(module.settings.contentElement) : module.$element,
                formMethod = $form.attr('method') || 'POST',
                url = module.settings.url || $form.attr('action');

            module.$element.on(module.settings.event, function(e) {
                e.preventDefault();

                module.$element.trigger('form-poster-submit');

                // disable button while request is processing
                $submitButton.prop('disabled', true);
                module.$element.addClass(module.settings.loadingCssClass);

                // send request
                $.ajax({
                    type: formMethod,
                    url: url,
                    data: $form.serialize()
                }).always(function () {
                    $submitButton.prop('disabled', false);
                    module.$element.removeClass(module.settings.loadingCssClass);
                }).done(function (response, status, xhr) {
                    if (module.settings.responseModule) {
                        mo.utils.removeModuleFromElement($contentElement, module.settings.responseModule);
                        mo.utils.addModuleToElement($contentElement, module.settings.responseModule, { response: response });
                    } else if (module.settings.contentElement && xhr.getResponseHeader('content-type').indexOf('text/html') !== -1) {
                        $contentElement.html(response);
                    }

                    module.$element.trigger('form-poster-done', { response: response });
                }).error(function () {
                    module.$element.trigger('form-poster-error');
                });
            });
        }
    });

})(jQuery);