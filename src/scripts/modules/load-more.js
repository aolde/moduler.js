(function () {
    "use strict";
    
    /*
        Example HTML:

        <div class="products">
            <!-- list products for page one. -->
        </div>

        <p>
            <a href="?page=2" data-module="load-more" data-load-more="url: '/api/products', contentElement: '.products'">Load results {from}-{to}</a>
        </p>
    */

    var moduleObj = moduler('load-more', {
        defaults: {
            url: null,
            event: 'click',
            data: null, /* extra data to send along the request to server */
            contentElement: null, /* selector for element where content should be appended or replaced */
            page: 1, /* the page currently on */
            insertMode : 'append', /* append|replace */
            loadingCssClass: 'loading',
            pageSize: null // size of each page, used when displaying page range in button. ("Results from 11-20")
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

            var linkHtml = module.$element.html();
            var shouldDisplayPageRange = linkHtml.indexOf('{from}') != -1;

            if (shouldDisplayPageRange) {
                module.shouldDisplayPageRange = true;
                module.linkHtml = linkHtml;

                moduleObj.updateLinkText(module);
            }
        },

        loadPage: function (module) {
            module.$element.addClass(module.settings.loadingCssClass);
            module.isLoading = true;

            $.ajax({
                type: 'GET',
                url: module.settings.url.replace('{page}', module.settings.page),
                data: $.extend({
                    partial: true,
                    page: module.settings.page
                }, module.settings.data)
            })
            .always(function () {
                module.$element.removeClass(module.settings.loadingCssClass);
                module.isLoading = false;
            })
            .done(function (response, status, xhr) {
                if (module.settings.insertMode == 'replace') {
                    module.$contentElement.html(response);
                } else if (module.settings.insertMode == 'append') {
                    module.$contentElement.append(response);
                }

                if (xhr.getResponseHeader('X-LastPage')) {
                    // hide the load more button instead of removing it so that 
                    // other modules can still trigger events
                    module.$element.hide();
                }

                if (module.shouldDisplayPageRange) {
                    moduleObj.updateLinkText(module);
                }

                module.$element.trigger('load-more-done', { response: response });
            })
            .error(function () {
                module.$element.trigger('load-more-error');
            });  
        },

        updateLinkText: function(module) {
            var from = (module.settings.page * module.settings.pageSize);
            var newLinkText = module.linkHtml
                .replace('{from}', from + 1)
                .replace('{to}', from + module.settings.pageSize);

            module.$element.html(newLinkText);
        },

        listen: {
            loadFirstPage: mo.event(function (module) {
                module.settings.page = 1;

                module.$element.show();
                module.$contentElement.empty();

                moduleObj.loadPage(module);
            }),

            loadMore: mo.event(function (module, e) {
                e.preventDefault();

                // prevent additional requests when user spam-clicks
                if (module.isLoading) {
                    return;
                }
                
                // increase page by one
                module.settings.page += 1;
                moduleObj.loadPage(module);
            })
        },

        destroy: function (module) {
            module.$element.off(module.settings.event, moduleObj.listen.loadMore);
        }
    });
    
})();