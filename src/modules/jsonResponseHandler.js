(function ($) {
    "use strict";

    var jsonResponseHandler = moduler('jsonResponseHandler', {
        defaults: {
            response: null,
            fromModule: null
        },

        init: function (module) {
            alert(JSON.stringify(module.settings.response.args));
            console.log('RESPONSE!', module.settings.response);
        }
    });

})(jQuery);