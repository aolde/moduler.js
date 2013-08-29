(function ($) {
    "use strict";

    var cool = moduler('cool', {
        //defaults: {
        //    name: 'Andreas',
        //    color: 'red'
        //},
        
        init: function (module) {
            $(module.element).on('click', mo.data(module), cool.listen.toggle);
            cool.listen.toggle(module);
        },

        listen: {
            toggle: mo.event(function (module) {
                module.settings.color = module.settings.color == 'red' ? 'green' : 'red';

                module.$element.removeClass('red green');
                module.$element.addClass(module.settings.color);
            }),
            
            makeRandom: mo.event(function(module, e) {
                console.log('previous', module.settings.random);
                module.settings.random = Math.random();
                
                //console.log('makeRandom', module.settings.random, this, arguments);
                //$(this).trigger('hello', ['hej ' + $(this).text()]);
            }),
            
            hello: mo.event(function (module, e, name) {
                console.log('cool:hello', this, arguments, module.settings.random, name);
                $(document).trigger('log', ['cool:hello']);
            })
        }
    });
    
})(jQuery);
