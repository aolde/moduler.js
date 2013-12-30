(function () {
    "use strict";
    
    // a simple example of how a valiation module could look 
    // and work together with other modules

    var moduleObj = moduler('validation', {
        init: function (module) {
            module.$element.on('submit.validation', mo.data(module), moduleObj.listen.validate);
        },

        listen: {
            validate: mo.event(function (module, e) {
                e.preventDefault();
                
                var isValid = true;

                module.$element.find('.required').each(function (element) {
                    var input = $(this);

                    if (!input.val()) {
                        isValid = false;
                        input.addClass('field-validation-error');
                    } else {
                        input.removeClass('field-validation-error');
                    }
                });

                if (isValid) {
                    module.$element.trigger('validation-valid');
                }
            })
        },

        destroy: function (module) {
            module.$element.off('submit.validation');
        }
    });
    
})();