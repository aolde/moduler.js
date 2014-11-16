(function () {
    "use strict";

    var moduleObj = moduler('map', {
        defaults: {
            apiKey: '', // optional
            apiScriptUrl: 'https://maps.googleapis.com/maps/api/js?key=&sensor=false&callback={callback}',
            markerClustererUrl: '../vendor/markerclusterer-2.1.2.js',
            data: null, // object or array of location:{ address, lat, lng }
            dataUrl: null, // url to json endpoint returning array of location:{ address, lat, lng }
            showMarkers: true,
            showInfoWindow: false,
            useMarkerClusterer: false,
            center: null, // point of center for map, { address, lat, lng }, (optional)
            zoom: 12,
            maxZoom: null, // can be used when displaying multiple markers (optional)
            infoWindowTemplate: '<div><h4><a href="{url}">{title}</a></h4><p>{description}</p></div>',
            
            styles: {
                pinImage: null,
                mapStyle: null, // paste in map style code, e.g. http://snazzymaps.com/style/150/old-school-maps-posters

                // docs: http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.1.2/docs/reference.html
                clusterStyles: [{
                    url: 'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m1.png',
                    height: 52,
                    width: 52,
                    textColor: '#fff'
                }]
            }
        },
        
        DataType: {
            multiple: 'multiple',
            single: 'single',
            service: 'service'
        },

        init: function (module) {
            var apiScriptPromise = mo.utils.loadScript(module.settings.apiScriptUrl, function() {
                    return ('google' in window && 'maps' in google);
                }),
                markerClustererPromise = module.settings.useMarkerClusterer ? mo.utils.loadScript(module.settings.markerClustererUrl, function() {
                    return ('MarkerClusterer' in window);
                }) : {};

            // markerClusterer will only be loaded when useMarkerClusterer is set to true.
            $.when(apiScriptPromise, markerClustererPromise).done(function () {
                moduleObj.mapsReady(module);
            });
        },

        mapsReady: function (module) {
            module.dataType =  moduleObj.getDataType(module);

            if (module.dataType === moduleObj.DataType.single) {
                var positions = [ module.settings.data ];
                moduleObj.displayPositions(module, positions);
            } 
            else if (module.dataType === moduleObj.DataType.multiple) {
                moduleObj.displayPositions(module, module.settings.data);
            } 
            else if (module.dataType === moduleObj.DataType.service) {
                $.getJSON(module.settings.dataUrl).done(function (response) {
                    moduleObj.displayPositions(module, response); 
                });
            }
        },

        displayPositions: function (module, data) {
            var deferres = [];

            for (var i in data) {
                var item = data[i];
                deferres.push(moduleObj.getPosition(item));
            }

            $.when.apply($, deferres).done(function () {
                var positions = $.makeArray(arguments);
                var isSinglePosition = positions.length == 1;
                
                var mapOptions = {
                    zoom: module.settings.zoom,
                    maxZoom: module.settings.maxZoom,
                    styles: module.settings.styles.mapStyle
                };

                if (isSinglePosition && !module.settings.center) {
                    mapOptions.center = positions[0];
                }

                var map = new google.maps.Map(module.element, mapOptions),
                    bounds = new google.maps.LatLngBounds(),
                    infoWindow = new google.maps.InfoWindow(),
                    markers = []; // array is only needed when using markerClusterer

                for (var i in positions) {
                    var position = positions[i];
                    
                    bounds.extend(position);

                    if (module.settings.showMarkers) {
                        var marker = moduleObj.addMarkerAndOverlayToMap(module, position, infoWindow, map);
                        markers.push(marker);
                    }
                }

                if (module.settings.useMarkerClusterer) {
                    var clusterOptions = {
                        styles: module.settings.styles.clusterStyles
                    };
                    var markerCluster = new MarkerClusterer(map, markers, clusterOptions);
                }

                if (module.settings.center) {
                    moduleObj.getPosition(module.settings.center).done(function (position) {
                        map.setCenter(position);
                    });
                } else if (!isSinglePosition) {
                    map.fitBounds(bounds);
                }
            });
        },

        addMarkerAndOverlayToMap: function (module, position, infoWindow, map) {
            var marker = new google.maps.Marker({
                position: position,
                title: position.title,
                map: map,
                clickable: module.settings.showInfoWindow,
                icon: module.settings.styles.pinImage
            });

            if (module.settings.showInfoWindow) {
                google.maps.event.addListener(marker, 'click', function() {
                    infoWindow.setContent(moduleObj.transformTemplate(module.settings.infoWindowTemplate, position));
                    infoWindow.open(map, marker);
                });
            }

            return marker;
        },
        
        getPosition: function (location) {
            var dfd = $.Deferred();
            
            //$.extend(new google.maps.LatLng(), {hej: 2})

            if (location.lat && location.lng) {
                var position = new google.maps.LatLng(location.lat, location.lng);
                dfd.resolve(moduleObj.extendPositionWithData(position, location));
            } 
            else if (location.address) {
                var geocoder = new google.maps.Geocoder();
                var requestInfo = { 
                    address: decodeURIComponent(location.address) 
                };

                geocoder.geocode(requestInfo, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var position = results[0].geometry.location;
                        
                        if (position) {
                            dfd.resolve(moduleObj.extendPositionWithData(position, location));
                            return dfd;
                        }
                    }

                    console.warn('geocoder lookup failed', status, location.address);
                    dfd.reject({ error: status, address: location.address });
                });
            }

            return dfd.promise();
        },

        extendPositionWithData: function (position, locationInfo) {
            locationInfo.lat = undefined; 
            locationInfo.lng = undefined;

            return $.extend(position, locationInfo);
        },

        getDataType: function (module) {
            var dataType = module.settings.data && $.isArray(module.settings.data) ? 
                                moduleObj.DataType.multiple : moduleObj.DataType.single;
            
            if (module.settings.dataUrl) {
                dataType = moduleObj.DataType.service;
            }

            return dataType;
        },

        transformTemplate: function (template, data) {
            var result = template;
            for (var key in data) {
                result = result.replace('{' + key + '}', decodeURIComponent(data[key]));
            }
            return result;
        }
    });
    
})();