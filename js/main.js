(function() {
    'use strict';

    var jamthegame = angular.module('jamthegame', ['ui.bootstrap']);


    jamthegame.provider('taskProvider', function() {
        var STORAGE_ID = 'jamthegameTasks';

        this.tasks = [];

        this.$get = function() {
            // Retrieve the stored tasks
            this.tasks = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');

            var exports = {
                tasks: this.tasks,

                persist: function() {
                    localStorage.setItem(STORAGE_ID, JSON.stringify(this.tasks, ['name', 'complete']));
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

    jamthegame.controller('AppCtrl', function($scope, taskProvider) {
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
    });

    jamthegame.constant('leaflet', window.L);

    jamthegame.directive('map', ['leaflet', function(L) {
        var numMaps = 0;

        return {
            restrict: 'A',
            scope: {},
            link: function (scope, elem) {
                var mapId = 'map-' + numMaps;
                numMaps += 1;
                elem.attr('id', mapId);

                var map = L.map(mapId);

                map.setView([46.948006, 7.444689], 13);

                 L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://openstreetmap.org">OSM</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | Tiles: <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OSM</a>'
                }).addTo(map);

                L.marker([46.948006, 7.444689]).addTo(map);
            }
        };
    }]);
})();