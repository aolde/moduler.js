(function () {
    "use strict";
    
    var moduleObj = moduler('load-more', {
        defaults: {
            url: null,
            event: 'click',
            contentElement: null, /* selector for element where content should be appended or replaced */
            page: 1, /* the page currently on */
            mode: 'append', /* append|replace */
            loadingCssClass: 'loading'
        },

        init: function (module) {
            if (!module.settings.url) {
                if (module.$element.is('a[href]')) {
                    module.settings.url = module.$element.attr('href');
                } else {
                    module.settings.url = window.location.href;
                }
            }
            
            // save a reference to contentElement
            module.$contentElement = module.settings.contentElement !== null ? $(module.settings.contentElement) : module.$element;

            module.$element.on(module.settings.event, module, moduleObj.listen.loadMore);
        },

        listen: {
            loadMore: mo.event(function (module, e) {
                e.preventDefault();

                // prevent additional requests when user spam-clicks
                if (module.isLoading) {
                    return;
                }

                module.$element.addClass(module.settings.loadingCssClass);
                
                // increase page by one
                module.settings.page += 1;
                module.isLoading = true;

                $.ajax({
                    type: 'GET',
                    url: module.settings.url.replace('{page}', module.settings.page),
                    data: { 
                        partial: true, 
                        page: module.settings.page 
                    }
                })
                .always(function () {
                    module.$element.removeClass(module.settings.loadingCssClass);
                    module.isLoading = false;
                })
                .done(function (response, status, xhr) {
                    if (module.settings.mode == 'replace') {
                        module.$contentElement.html(response);
                    } else if (module.settings.mode == 'append') {
                        module.$contentElement.append(response);
                    }

                    if (xhr.getResponseHeader('X-LastPage')) {
                        module.$element.remove();
                    }

                    module.$element.trigger('load-more-done', { response: response });
                })
                .error(function () {
                    module.$element.trigger('load-more-error');
                });
            })
        },

        destroy: function (module) {
            module.$element.off(module.settings.event, moduleObj.listen.loadMore);
        }
    });
    
})();