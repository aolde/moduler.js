(function () {
    "use strict";

    /*
        Example HTML:

        <div class="tabs" data-module="tabs">
            <ul class="tabs-handles">
                <li class="tabs-handle" data-name="tab-one">Tab One</li>
                <li class="tabs-handle" data-name="tab-two">Tab Two</li>
            </ul>

            <div class="tabs-panels">
                <div class="tabs-panel">
                    <!-- panel 1 -->
                </div>

                <div class="tabs-panel">
                    <!-- panel 2 -->
                </div>
            </div>
        </div>
    */

    var moduleObj = moduler('tabs', {
        defaults: {
            event: 'click',
            handles: '.tabs-handle',
            panels: '.tabs-panel',
            activeClass: 'is-active',
            togglable: false, // whether to allow a panel to close if you click on its handle again.
            showFirst: true, // whether to show first panel on load.
            selectedPanel: null // the panel to show at page load (optional).
        },
        
        init: function (module) {
            module.$handles = module.$element.find(module.settings.handles);
            module.$panels = module.$element.find(module.settings.panels);

            module.$handles.on(module.settings.event, module, moduleObj.listen.showPanel);

            if (module.settings.selectedPanel) {
                module.$handles.filter('[data-name=' + module.settings.selectedPanel + ']').trigger(module.settings.event);
            } else if (module.settings.showFirst) {
                module.$handles.first().trigger(module.settings.event);
            }
        },
        
        listen: {
            showPanel: mo.event(function (module, e) {
                e.preventDefault();
                
                var $handle = $(e.target),
                    settings = module.settings,
                    handleIndex = module.$handles.index($handle),
                    $panel = module.$panels.eq(handleIndex);

                // if event was triggered on a link inside "handles" then we try to find the handle element now
                if (!$handle.is(module.settings.handles)) {
                    $handle = $handle.closest(module.settings.handles);
                    handleIndex = module.$handles.index($handle);
                    $panel = module.$panels.eq(handleIndex);
                }

                module.$handles.not($handle).removeClass(settings.activeClass).trigger('tab-hide');
                module.$panels.not($panel).removeClass(settings.activeClass).trigger('tab-hide');

                var classFuncName = settings.togglable ? 'toggleClass' : 'addClass';
                $handle[classFuncName](settings.activeClass).trigger('tab-show');
                $panel[classFuncName](settings.activeClass).trigger('tab-show');   
            })
        },
        
        destroy: function (module) {
            module.$handles.off(module.settings.event, moduleObj.listen.showPanel);
        }
    });
    
})();