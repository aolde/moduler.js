(function ($) {
    "use strict";

    var app = moduler('app', {
        defaults: {
            
        },
        
        init: function (settings) {
            
        },
        
        listen: {
            log: function (e, message) {
                console.log(this, arguments);
                $('.log').append(message + '<br>');
            }
        }
    });
    
})(jQuery);