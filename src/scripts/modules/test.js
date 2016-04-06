define(['moduler'], function (Moduler) {
    'use strict';
    
    console.info('TEST MODULE CALLED');

    // return Moduler.Create({
    return {
        defaults: {
            name: ''
        },
        
        events: {
            'click': 'clickHandler'
        },
        
        init: function () {
            console.debug('INIT in MODULE', this);
            
            this.el.textContent += ' Ready ' + this.options.name;
        },
        
        postInit: function () {
            console.debug('POST INIT in MODULE', this);
            
        }
    };
});