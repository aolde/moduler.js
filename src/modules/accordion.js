(function () {
    "use strict";

    /*
        Example HTML:

        <div class="accordion" data-module="accordion">
            <h3 class="accordion-header">Panel 1</h3>
            <div class="accordion-panel">
                <!-- content 1 -->
            </div>

            <h3 class="accordion-header">Panel 2</h3>
            <div class="accordion-panel">
                <!-- content 2 -->
            </div>
        </div>
    */

    var moduleObj = moduler('accordion', {
        defaults: {
            event: 'click',
            headers: '.accordion-header',
            panels: '.accordion-panel',
            activeClass: 'is-active',
            mode: 'accordion', // accordion|toggle
            slide: true,
            slideDelay: 400,
            expandFirst: false
        },
        
        init: function (module) {
            module.$headers = module.$element.find(module.settings.headers);
            module.$panels = module.$element.find(module.settings.panels);

            if (module.settings.slide) {
                module.$panels.hide();
            }

            module.$headers.on(module.settings.event, module, moduleObj.listen.expandPanel);

            module.$element.addClass('js-ready');

            if (module.settings.expandFirst) {
                module.$headers.first().trigger(module.settings.event);
            }
        },
        
        listen: {
            expandAll: mo.event(function (module) {
                module.$headers.addClass(module.settings.activeClass).trigger('accordion-expand');
                module.$panels.addClass(module.settings.activeClass).trigger('accordion-expand');
                
                if (module.settings.slide) {
                    module.$panels.slideDown(module.settings.slideDelay);
                }
            }),

            collapseAll: mo.event(function (module, e) {
                module.$headers.removeClass(module.settings.activeClass).trigger('accordion-collapse');
                module.$panels.removeClass(module.settings.activeClass).trigger('accordion-collapse');
            
                if (module.settings.slide) {
                    module.$panels.slideUp(module.settings.slideDelay);
                }
            }),

            expandPanel: mo.event(function (module, e) {
                e.preventDefault();
                
                var $header = $(e.target),
                    settings = module.settings,
                    headerIndex = module.$headers.index($header),
                    $panel = module.$panels.eq(headerIndex);

                if (settings.mode == 'accordion') {
                    module.$headers.not($header).removeClass(settings.activeClass).trigger('accordion-collapse');
                    module.$panels.not($panel).removeClass(settings.activeClass).trigger('accordion-collapse');
                    
                    if (settings.slide) {
                        module.$panels.not($panel).slideUp(settings.slideDelay);
                    }
                }

                $header.toggleClass(settings.activeClass).trigger('accordion-expand');
                $panel.toggleClass(settings.activeClass).trigger('accordion-expand');
                
                if (settings.slide) {
                    $panel.stop(true).slideToggle(settings.slideDelay);
                }
            })
        },
        
        destroy: function (module) {
            module.$headers.off(module.settings.event, moduleObj.listen.expandPanel);
        }
    });
    
})();