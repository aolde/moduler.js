(function () {
    "use strict";

    var moduleObj = moduler('lazy', {
        defaults: {},
        
        init: function (module) {
            module.$lazyElements = moduleObj.getLazyElements(module);

            moduleObj.listenOnScroll(module, function () {
                moduleObj.checkElements(module);
            });

            $(document).on('domChanged', function () {
                module.$lazyElements = moduleObj.getLazyElements(module);
                moduleObj.checkElements(module);
            });
        },

        checkElements: function (module) {
            if (module.$lazyElements.length === 0) {
                return;
            }
            
            var $window = $(window),
                windowHeight = $window.height(),
                windowWidth = $window.width();

            module.$lazyElements.each(function (i, element) {
                var $element = $(element);
                if (!$element.is(':visible')) {
                    return;
                }

                if (moduleObj.isElementInViewport(element, windowHeight, windowWidth)) {
                    $element.trigger('lazy').prop('_mo-lazy-loaded', true);
                }
            });

            // update list of elements that needs to be initialized.
            module.$lazyElements = moduleObj.getLazyElements(module);
        },

        getLazyElements: function (module) {
            var $elements = $('[data-module*=":lazy"]', module.element).filter(function (i, element) {
                return !moduleObj.isElementLoaded(element);
            });
            return $elements;
        },

        isElementInViewport: function (element, windowHeight, windowWidth) {
            var rect = element.getBoundingClientRect();

            // returns true if any part of the element is visible within the viewport.
            return (
                rect.right >= 0 &&
                rect.left <= windowWidth &&
                rect.bottom >= 0 &&
                rect.top <= windowHeight
            );
        },
        
        isElementLoaded: function (element) {
            return $(element).prop('_mo-lazy-loaded');
        },

        listenOnScroll: function (module, callback) {
            $(window).on('scroll.lazy', function () {
                module.hasScrolled = true;
            }).trigger('scroll.lazy');

            module.checkTimer = setInterval(function () {
                if (module.hasScrolled) {
                    module.hasScrolled = false;
                    callback();
                }
            }, 100);
        },

        destroy: function (module) { 
            $(window).off('scroll.lazy');
            clearInterval(module.checkTimer);
        }
    });
    
})();