(function() {
    'use strict';

    var jamthegame = angular.module('jamthegame', ['ui.bootstrap', 'ui.router', 'leaflet-directive']);

    jamthegame.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('tasks', {
            url: '/'
        });

        $stateProvider.state('map', {
            url: '/map'
        });
    });


    jamthegame.provider('taskProvider', function() {
        var STORAGE_ID = 'jamthegameTasks';

        var TO_PERSIST = ['name', 'complete'];

        this.tasks = [];

        this.$get = function() {
            // Retrieve the stored tasks
            this.tasks = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');

            var exports = {
                tasks: this.tasks,

                persist: function() {
                    localStorage.setItem(STORAGE_ID, JSON.stringify(this.tasks, TO_PERSIST));
                },

                addTask: function(task) {
                    this.tasks.unshift(task);
                },

                removeTask: function(task) {
                    for (var i = 0; i < this.tasks.length; i++) {
                        if (this.tasks[i] === task) {
                            this.tasks.splice(i, 1);
                            break;
                        }
                    }
                }
            };

            return exports;
        };
    });

    jamthegame.provider('markerProvider', function() {
        var STORAGE_ID = 'jamthegameMarkers';

        var TO_PERSIST = ['lat', 'lng', 'message'];

        var ICON = L.icon({
            iconUrl: 'vendor/images/marker-icon.png',
            iconRetinaUrl: 'vendor/images/marker-icon-2x.png',
            shadowUrl: 'vendor/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 40],
            popupAnchor: [0, -40],
            shadowSize: [41, 41],
            shadowAnchor: [12, 40]
        });

        this.markers = [];

        this.$get = function() {
            // Retrieve the stored markers
            this.markers = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].icon = ICON;
            }

            var exports = {
                markers: this.markers,

                persist: function() {
                    localStorage.setItem(STORAGE_ID, JSON.stringify(this.markers, TO_PERSIST));
                },

                addMarker: function(latLng) {
                    this.markers.unshift({
                        lat: latLng.lat,
                        lng: latLng.lng,
                        message: 'Marker at ' + latLng.lat.toFixed(6) + ', ' + latLng.lng.toFixed(6),
                        icon: ICON
                    });
                },

                removeMarker: function(marker) {
                    console.log(this);
                    for (var i = 0; i < this.markers.length; i++) {
                        if (this.markers[i] === marker) {
                            this.markers.splice(i, 1);
                            break;
                        }
                    }
                }
            };

            return exports;
        };
    });

    jamthegame.controller('AppCtrl', function($scope, $state, taskProvider, markerProvider, leafletData) {
        $scope.$state = $state;


        // Tasks
        $scope.tasks = taskProvider.tasks;

        $scope.newTaskName = '';

        $scope.createNewTask = function() {
            if ($scope.newTaskName) {
                taskProvider.addTask({
                    name: $scope.newTaskName,
                    complete: false
                });
                $scope.newTaskName = '';
            }
        };

        $scope.removeTask = taskProvider.removeTask;

        $scope.$watch('tasks', function() {
            taskProvider.persist();
        }, true);



        // Map
        $scope.mapDefaults = {
            tileLayer: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            tileLayerOptions: {
                attribution: '&copy; <a href="http://openstreetmap.org">OSM</a> contribs, <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OSM</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            },
            maxZoom: 16,
            minZoom: 10,
            zoomControl: false
        };

        $scope.mapCentre = {
            lat: 46.948006,
            lng: 7.444689,
            zoom: 13
        };

        $scope.mapMarkers = markerProvider.markers;

        $scope.mapEvents = {
            map: {
                enable: ['click'],
                logic: 'emit'
            }
        };

        $scope.$on('leafletDirectiveMap.click', function(event, origEvent){
            var latLng = origEvent.leafletEvent.latlng;
            markerProvider.addMarker(latLng);
        });

        $scope.removeMarker = function(marker) {
            markerProvider.removeMarker(marker);
        };

        // Need to tell leaflet when map is shown after being hidden
        // See: https://github.com/tombatossals/angular-leaflet-directive/issues/168
        $scope.$watch('$state.current.name', function(value) {
            if (value === 'map') {
                leafletData.getMap().then(function(map) {
                    map.invalidateSize();
                });
            }
        });

        $scope.$watch('mapMarkers', function() {
            markerProvider.persist();
        }, true);
    });
})();