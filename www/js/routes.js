angular.module('app.routes', [])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl'
            })

            .state('home', {
                url: '/home',
                templateUrl: 'templates/home.html',
                controller: 'homeCtrl'
            })
            .state('menu', {
                url: '/menu',
                templateUrl: 'templates/menu.html',
                controller: 'menuCtrl'
            })
            .state('item-details', {
                url: '/item-details/:itemId',
                templateUrl: 'templates/item-details.html',
                controller: 'itemDetailsCtrl'
            })
            .state('edit-item-details', {
            url: '/edit-item-details/:itemId',
            templateUrl: 'templates/edit-appointment.html',
            controller: 'editItemDetailsCtrl'
        }).state('reserve-person', {
            url: '/reserve-person',
            templateUrl: 'templates/reserve-person.html',
            controller: 'reservePersonCtrl'
        }).state('reserve-procedure', {
            url: '/reserve-procedure/:clientId/:clientName',
            templateUrl: 'templates/reserve-procedure.html',
            controller: 'reserveProcedureCtrl'
        }).state('reserve-date', {
            url: '/reserve-date/:clientId/:clientName/:procedureId/:procedureDuration',
            templateUrl: 'templates/reserve-date.html',
            controller: 'reserveDateCtrl'
        }).state('calendar', {
            url: '/calendar',
            templateUrl: 'templates/calendar.html',
            controller: 'calendarCtrl'
        }).state('add-appointment-note', {
            url: '/add-appointment-note/:itemId',
            templateUrl: 'templates/add-appointment-note.html',
            controller: 'addAppointmentNote'
        });

        $urlRouterProvider.otherwise('/login');


    });