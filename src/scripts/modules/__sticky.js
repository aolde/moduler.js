(function () {
    "use strict";

    var moduleObj = moduler('sticky', {
        defaults: {
            stickyHeightLimit: 50, // when to add the shrunk class
            cssClass: 'is-shrunk'
        },

        init: function (module) {
            var scrollFired = false;

            $(window).scroll(function(event) {
                if (!scrollFired) {
                    scrollFired = true;
                    setTimeout(scrollPage, 50);
                }
            });
            
            function scrollPage() {
                var sy = getScrollY();

                if (sy >= module.settings.stickyHeightLimit) {
                    module.$element.addClass(module.settings.cssClass);
                } else {
                    module.$element.removeClass(module.settings.cssClass);
                }

                scrollFired = false;
            }

            scrollPage();

            function getScrollY() {
                return window.pageYOffset || document.documentElement.scrollTop;
            }
        }
    });

})();