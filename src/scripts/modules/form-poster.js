(function($) {
    "use strict";

    var moduleObj = moduler('form-poster', {
        defaults: {
            submitButton: 'input[type=submit], button[type=submit]',
            url: null, // override the form's url. in case you want different url for ajax requests.
            data: null, /* extra data to send along the request to server */
            event: 'submit',
            contentElement: null,
            responseModule: null,
            loadingCssClass: 'form-loading',
            responseSegment: false // update only a segment of the response (contentElement segment)
        },

        init: function(module) {
            module.$element.on(module.settings.event, module, moduleObj.listen.sendForm);
        },

        listen: {
            sendForm: mo.event(function (module, e) {
                var $form = module.$element.is('form') ? module.$element : module.$element.find('form'),
                    $submitButton = $form.find(module.settings.submitButton),
                    $contentElement = module.settings.contentElement !== null ? $(module.settings.contentElement) : module.$element,
                    formMethod = $form.attr('method') || 'POST',
                    url = module.settings.url || $form.attr('action');

                e.preventDefault();
                
                // disable button while request is processing
                $submitButton.prop('disabled', true);
                module.$element.addClass(module.settings.loadingCssClass);

                // send request
                $.ajax({
                    type: formMethod,
                    url: url,
                    data: $.extend(moduleObj.serializeFormObject($form), module.settings.data)
                }).always(function () {
                    $submitButton.prop('disabled', false);
                    module.$element.removeClass(module.settings.loadingCssClass);
                }).done(function (response, status, xhr) {
                    if (module.settings.responseModule) {
                        mo.utils.removeModuleFromElement($contentElement, module.settings.responseModule);
                        mo.utils.addModuleToElement($contentElement, module.settings.responseModule, { response: response });
                    } else if ($contentElement.length) {
                        if (module.settings.responseSegment) {
                            response = $($.parseHTML(response)).find(module.settings.contentElement).html();
                        }
                        $contentElement.html(response);
                    }

                    module.$element.trigger('form-poster-done', { response: response });
                }).error(function () {
                    module.$element.trigger('form-poster-error');
                });
            })
        },

        serializeFormObject: function($element) {
            var obj = {};
            $.each($element.serializeArray(), function (_, item) {
                if (obj.hasOwnProperty(item.name)) {
                    obj[item.name] = $.makeArray(obj[item.name]);
                    obj[item.name].push(item.value);
                }
                else {
                    obj[item.name] = item.value;
                }
            });
            return obj;
        },

        destroy: function (module) {
            module.$element.off(module.settings.event, moduleObj.listen.sendForm);
        }
    });

})(jQuery);