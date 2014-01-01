(function ($) {
    "use strict";

    /* a dummy module to show how something simple is accomplished in moduler.js */

    var moduleObj = moduler('background', {
        defaults: {
          color: 'red'
        },
    
        init: function (module) {
            module.$element.on('click', module, moduleObj.listen.toggle);
            moduleObj.listen.toggle(module);
        },

        listen: {
            toggle: mo.event(function (module) {
                // state is saved per each module instance
                module.settings.color = module.settings.color == 'red' ? 'green' : 'red';

                module.$element.removeClass('red green');
                module.$element.addClass(module.settings.color);
            })
        }
    });
    
})(jQuery);
