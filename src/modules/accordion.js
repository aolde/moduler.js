(function () {
    "use strict";

    var moduleObj = moduler('accordion', {
        defaults: {
        	event: 'click',
        	headerClass: 'accordion-header',
        	sectionClass: 'accordion-section',
        	activeClass: 'is-active',
        	mode: 'accordion', // accordion|toggle
        	slide: true,
        	slideDelay: 400,
        	expandFirst: false
        },
        
        init: function (module) {
        	module.$headers = module.$element.find('.' + module.settings.headerClass);
        	module.$sections = module.$element.find('.' + module.settings.sectionClass);

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
            module.$headers.off('click', moduleObj.listen.expandSection);
        }
    });
    
})();