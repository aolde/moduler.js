(function($) {
    "use strict";

    var formPoster = moduler('formPoster', {
        defaults: {
            submitButton: 'input[type=submit], button[type=submit]',
            url: null, // override the form's url. in case you want different url for ajax request.
            contentElement: null,
            successModule: null,
            loadingCssClass: 'form-loading'
        },

        init: function(module) {
            var $form = module.$element.is('form') ? module.$element : module.$element.find('form'),
                $submitButton = $form.find(module.settings.submitButton),
                $contentElement = module.settings.contentElement !== null ? $(module.settings.contentElement) : module.$element,
                formMethod = $form.attr('method') || 'POST',
                url = module.settings.url || $form.attr('action');

            $form.submit(function(e) {
                e.preventDefault();

                // disable button while request is processing
                $submitButton.prop('disabled', true);
                module.$element.addClass(module.settings.loadingCssClass);

                // send request
                $.ajax({
                    type: formMethod,
                    url: url,
                    data: $form.serialize()
                }).done(function (response, status, xhr) {
                    if (module.settings.successModule) {
                        mo.utils.removeModuleFromElement($contentElement, module.settings.successModule);
                        mo.utils.addModuleToElement($contentElement, module.settings.successModule, { response: response, fromModule: module });
                    } else if (module.settings.contentElement && xhr.getResponseHeader('content-type').indexOf('text/html') !== -1) {
                        $contentElement.html(response);
                    }

                    $submitButton.prop('disabled', false);
                    module.$element.removeClass(module.settings.loadingCssClass);
                    module.$element.trigger('formPoster-done');
                }).error(function () {
                    module.$element.trigger('formPoster-error');
                });
            });
        }
    });

})(jQuery);