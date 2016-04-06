(function () {
    "use strict";

    var moduleObj = moduler('cookie-checker', {
        defaults: {
            cookieKey: 'acceptCookies'
        },

        init: function (module) {
            if (document.cookie.indexOf(module.settings.cookieKey) < 0) {
                module.$element.slideDown(500);
            }
            module.$element.find(".js-close").on('click', module, moduleObj.listen.hideMessage);
        },

        listen: {
            hideMessage: mo.event(function (module, e) {
                e.preventDefault();

                module.$element.slideUp(500);
                document.cookie = escape(module.settings.cookieKey) + "=1; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
            })
        },

        destroy: function (module) { }
    });

})();