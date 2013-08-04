(function (moduler, $) {
    "use strict";

    var app = moduler('app', {
        defaults: {
            name: 'Andreas'
        },
        
        init: function (settings) {
            $(document).trigger('log', ['Hej ' + settings.name]);
        },
        
        listen: {
            log: function (e, message) {
                console.log(this, arguments);
                $('.log').append(message + '<br>');
            },
            'add-to-basket': function() {
                
            },
            'app.remove': function (e) {
                //e.preventDefault();
                //console.log('app');
                //$(e.target).remove();
                //return false;
            }
        }
    });
    
})(moduler, jQuery);