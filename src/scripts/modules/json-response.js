(function ($) {
    "use strict";
    
    /* example of how a response module could look */

    var moduleObj = moduler('json-response', {
        defaults: {
            response: null
        },

        init: function (module) {
            var formatValues = "",
                response = module.settings.response;

            for (var prop in response) {
                formatValues += prop + "=" + JSON.stringify(response[prop]) + "\n\n"; 
            }

            alert(formatValues);
            console.log('RESPONSE!', module.settings.response);
        }
    });

})(jQuery);