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
})();