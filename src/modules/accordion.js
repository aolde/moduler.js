(function () {
    "use strict";

    /*
        Example HTML:

        <div class="accordion" data-module="accordion">
            <h3 class="accordion-header">Section 1</h3>
            <div class="accordion-section">
                <!-- content 1 -->
            </div>

            <h3 class="accordion-header">Section 2</h3>
            <div class="accordion-section">
                <!-- content 2 -->
            </div>
        </div>
    */

    var moduleObj = moduler('accordion', {
        defaults: {
            event: 'click',
            headers: '.accordion-header',
            sections: '.accordion-section',
            activeClass: 'is-active',
            mode: 'accordion', // accordion|toggle
            slide: true,
            slideDelay: 400,
            expandFirst: false
        },
        
        init: function (module) {
            module.$headers = module.$element.find(module.settings.headers);
            module.$sections = module.$element.find(module.settings.sections);

            if (module.settings.slide) {
                module.$sections.hide();
            }

            module.$headers.on(module.settings.event, module, moduleObj.listen.expandSection);

            module.$element.addClass('js-ready');

            if (module.settings.expandFirst) {
                module.$headers.first().trigger(module.settings.event);
            }
        },
        
        listen: {
            expandAll: mo.event(function (module) {
                module.$headers.addClass(module.settings.activeClass).trigger('accordion-expand');
                module.$sections.addClass(module.settings.activeClass).trigger('accordion-expand');
                
                if (module.settings.slide) {
                    module.$sections.slideDown(module.settings.slideDelay);
                }
            }),

            collapseAll: mo.event(function (module, e) {
                module.$headers.removeClass(module.settings.activeClass).trigger('accordion-collapse');
                module.$sections.removeClass(module.settings.activeClass).trigger('accordion-collapse');
            
                if (module.settings.slide) {
                    module.$sections.slideUp(module.settings.slideDelay);
                }
            }),

            expandSection: mo.event(function (module, e) {
                e.preventDefault();
                
                var $header = $(e.target),
                    settings = module.settings,
                    headerIndex = module.$headers.index($header),
                    $section = module.$sections.eq(headerIndex);

                if (settings.mode == 'accordion') {
                    module.$headers.not($header).removeClass(settings.activeClass).trigger('accordion-collapse');
                    module.$sections.not($section).removeClass(settings.activeClass).trigger('accordion-collapse');
                    
                    if (settings.slide) {
                        module.$sections.not($section).slideUp(settings.slideDelay);
                    }
                }

                $header.toggleClass(settings.activeClass).trigger('accordion-expand');
                $section.toggleClass(settings.activeClass).trigger('accordion-expand');
                
                if (settings.slide) {
                    $section.stop(true).slideToggle(settings.slideDelay);
                }
            })
        },
        
        destroy: function (module) {
            module.$headers.off(module.settings.event, moduleObj.listen.expandSection);
        }
    });
    
})();