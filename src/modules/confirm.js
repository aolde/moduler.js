(function () {
    "use strict";

    var moduleObj = moduler('confirm', {
        defaults: {
            message: 'Are you sure you want to perform this action?',
            event: 'click'
        },
        
        init: function (module) {
            module.$element.on(module.settings.event, module, moduleObj.listen.showConfirm);
        },

        listen: {
            showConfirm: mo.event(function (module, e) {
                e.preventDefault();

                if (window.confirm(module.settings.message)) {
                    module.$element.trigger('confirm-yes');
                } else {
                    module.$element.trigger('confirm-no');
                }
            })
        },
        
        destroy: function () {
            module.$element.off(module.settings.event, moduleObj.listen.showConfirm);
        }
    });
    
})();