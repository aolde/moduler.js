(function () {
    "use strict";

    var moduleObj = moduler('modal', {
        defaults: {
            event: 'click', // the event to open the modal on
            contentElement: null, // selector for the  Modal component
            replaceHtmlAfterClose: true, // if true will restore the html to the initial state
            activeCssClass: 'Modal--active'
        },
        
        init: function (module) {
            module.$contentElement = $(module.settings.contentElement);
            module.contentElementHtml = module.$contentElement.html();

            moduleObj.initEvents(module);
        },

        initEvents: function (module) {

            // opening the modal
            module.$element.on(module.settings.event, function (e) {
                e.preventDefault();

                // move modal element to body to avoid z-index issues.
                if (!module.$contentElement.parent().is('body')) {
                    module.$contentElement.detach().appendTo('body');
                }

                module.$contentElement.addClass(module.settings.activeCssClass);
                module.$contentElement.add(module.$element).trigger('modal-open');
            });

            // closing window by clicking close link
            module.$contentElement.on('click', '.js-close', function (e) {
                e.preventDefault();

                moduleObj.closeDialog(module);
            });

            // closing window by clicking overlay
            module.$contentElement.on('click', function (e) {
                if (!$(e.target).is('.Modal'))
                    return;

                e.preventDefault();
                moduleObj.closeDialog(module);
            });
        },

        closeDialog: function(module) {
            module.$contentElement.removeClass(module.settings.activeCssClass);

            if (module.settings.replaceHtmlAfterClose) {
                module.$contentElement.html(module.contentElementHtml);

                if ('validator' in $ && 'unobtrusive' in $.validator) {
                    $.validator.unobtrusive.parse(module.settings.contentElement);
                }
            }

            module.$contentElement.add(module.$element).trigger('modal-close');
        }
    });
    
})();