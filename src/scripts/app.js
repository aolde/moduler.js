define(['moduler'], function (Moduler) {
    console.log(Moduler)
    
    var initialize = function() {
        Moduler.initialize();
    }

    return {
        initialize: initialize
    };
});