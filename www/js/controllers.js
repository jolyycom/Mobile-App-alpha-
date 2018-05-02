angular.module('app.controllers', [])

    .controller('loginCtrl', ['$scope', '$state', '$ionicLoading', 'UserInterface',
        function ($scope, $state, $ionicLoading, UserInterface) {
            "use strict";
            $scope.$on('$ionicView.beforeEnter', function () {
                //do stuff before enter
                if (UserInterface.isLoggedIn()) {
                    $state.go('home');
                }
            });
            $scope.errors = [];
            $scope.form = {
                vendor: '',
                name: '',
                password: ''
            };
            //login method
            $scope.login = function () {
                "use strict";
                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0,

                }).then(function () {
                    UserInterface.login($scope.form).then(function (data) {
                        //success
                        UserInterface.startPushNotificationService();
                        $scope.errors = [];
                        $ionicLoading.hide().then(function () {
                            $state.go('home');
                        });

                    }, function (errors) {
                        //error
                        $scope.errors = errors;
                        $ionicLoading.hide();

                    });
                })
            }

        }])

    .controller('homeCtrl', ['$scope', '$state', 'UserInterface', '$ionicLoading',
        function ($scope, $state, UserInterface, $ionicLoading) {
            "use strict";
            $scope.$on('$ionicView.beforeEnter', function () {
                //do stuff before enter
                if (!UserInterface.isLoggedIn()) {
                    $scope.currentUser = null;
                    $state.go('login');
                } else {
                    $scope.currentUser = UserInterface.getUser();
                    $scope.vendorImage = $scope.currentUser.vendor.logo;
                    $scope.userImage = $scope.currentUser.user.image;
                    $scope.loadAppointments();
                }
            });
            $scope.loadAppointments = function () {
                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0,

                }).then(function () {
                    UserInterface.startPushNotificationService();
                    UserInterface.setApplicationIconBadgeNumber(0);
                    UserInterface.getAppointments().then(function (appointments) {
                        //success
                        $scope.errors = [];
                        $ionicLoading.hide();
                        $scope.appointments = appointments;
                        $scope.$broadcast('scroll.refreshComplete');

                        //UserInterface.scheduleAppointmentsReminder(appointments);

                    }, function (errors) {
                        //error
                        $ionicLoading.hide();
                        $scope.errors = errors;
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                })
            };
        }])
    .controller('menuCtrl', ['$scope', '$state', 'UserInterface',
        function ($scope, $state, UserInterface) {
            "use strict";
            $scope.$on('$ionicView.beforeEnter', function () {
                //do stuff before enter
                if (!UserInterface.isLoggedIn()) {
                    $scope.currentUser = null;
                    $state.go('login');
                } else {
                    $scope.currentUser = UserInterface.getUser()
                    $scope.vendorImage = $scope.currentUser.vendor.logo;
                    $scope.userImage = $scope.currentUser.user.image;
                }
            });
            $scope.logout = function ($event) {
                $event.preventDefault();
                UserInterface.logout();
                $state.go('login');
            }
        }])
    .controller('itemDetailsCtrl', ['$scope', '$state', '$stateParams', 'UserInterface', '$ionicPopup', '$ionicLoading', function ($scope, $state, $stateParams, UserInterface, $ionicPopup, $ionicLoading) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.details = {};
            $scope.time = "";
            $scope.selectedDate = {};
            $scope.errors = []


            if (typeof $stateParams.itemId != "undefined") {
                $scope.details = UserInterface.getAppointmentById($stateParams.itemId)
                if ($scope.details.client == "") $scope.details.client = "Гост";
                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0,
                }).then(function () {
                    UserInterface.getAppointmentNotes($stateParams.itemId).then(function (notes) {
                        $scope.notes = notes;
                        $ionicLoading.hide();
                        $scope.errors = [];
                    }, function (errors) {
                        $ionicLoading.hide();
                        $scope.errors = errors;
                        $ionicLoading.hide();
                    });
                });
            } else {
                $scope.errors = ['Нещо се обърка при отваряне на детаилите за тази поръчка!']

            }
        });

        $scope.deleteNote = function (id) {
            $ionicPopup.confirm({
                title: 'Изтриване на бележка',
                template: 'Сигурни ли сте, че искате да изтриете тази бележка?',
                buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: 'Не',
                    type: 'button-default',
                    onTap: function (e) {
                        // Returning a value will cause the promise to resolve with the given value.
                        return false
                    }
                }, {
                    text: 'Да',
                    type: 'button-positive',
                    onTap: function (e) {
                        // Returning a value will cause the promise to resolve with the given value.
                        return true
                    }
                }]
            }).then(function (responce) {
                console.log('User said ' + responce);
                if (responce) {
                    /*
                     UserInterface.cancelAppointment(id);
                     $scope.goBack(true);
                     */
                    $ionicLoading.show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0,
                    }).then( function () {

                        UserInterface.deleteAppointmentNote(id).then(function (result) {
                            //success
                            UserInterface.getAppointmentNotes($stateParams.itemId).then(function (notes) {
                                $scope.notes = notes;
                                $ionicLoading.hide();
                                $scope.errors = [];
                            }, function (errors) {

                                $scope.errors = errors;
                                $ionicLoading.hide();
                            });
                        }, function (errors) {
                            //error
                            $scope.errors = errors;
                            $ionicLoading.hide();
                        });
                    });
                }
            }, function (no) {
                console.log('User said no !');
            })
        };

        $scope.cancelAppointment = function (id) {
            $ionicPopup.confirm({
                title: 'Откажи запазен час',
                template: 'Сигурни ли сте, че искате да откажете този час?',
                buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: 'Не',
                    type: 'button-default',
                    onTap: function (e) {
                        // Returning a value will cause the promise to resolve with the given value.
                        return false
                    }
                }, {
                    text: 'Да',
                    type: 'button-positive',
                    onTap: function (e) {
                        // Returning a value will cause the promise to resolve with the given value.
                        return true
                    }
                }]
            }).then(function (responce) {
                console.log('User said ' + responce);
                if (responce) {
                   /*
                    UserInterface.cancelAppointment(id);
                    $scope.goBack(true);
                    */
                    UserInterface.cancelAppointment(id).then(function (result) {
                        //success
                        $scope.errors = [];
                        $scope.goBack(true);
                    }, function (errors) {
                        //error
                        $scope.errors = errors;
                    });
                }
            }, function (no) {
                console.log('User said no !');
            })
        };
    }])

    .controller('addAppointmentNote', ['$scope', '$state', '$stateParams', 'UserInterface', '$ionicPopup', '$ionicLoading', function ($scope, $state, $stateParams, UserInterface, $ionicPopup, $ionicLoading) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.details = {};
            $scope.time = "";
            $scope.selectedDate = {};
            $scope.errors = []
            $scope.form = {note_text : ""};


            if (typeof $stateParams.itemId != "undefined") {
                $scope.errors = [];
                $scope.details = UserInterface.getAppointmentById($stateParams.itemId);
            } else {
                $scope.errors = ['Нещо се обърка при отваряне на детаилите за тази поръчка!']

            }
        });

        $scope.saveAppointmentNote = function (e) {
            e.preventDefault();
            if ($scope.form.note_text == null || $scope.form.note_text == "" )
            {
                alert("Моля въведете текст на бележката.");
                return;
            }
            $ionicLoading.show({
                content: 'Saving',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,

            }).then(function (success) {
                UserInterface.createAppointmentNote($scope.details.id, $scope.form.note_text ).then(function (success) {
                    //success
                    $scope.errors = [];
                    $ionicLoading.hide().then(function () {
                        $scope.goBack(true);
                    });
                }, function (errors) {
                    //error
                    $ionicLoading.hide();
                    $scope.errors = errors;

                })
            }, function (error) {

            })
        };

    }])

    .controller('editItemDetailsCtrl', ['$scope', '$state', '$stateParams', 'UserInterface', 'Utils', '$ionicScrollDelegate', '$ionicLoading', '$document', function ($scope, $state, $stateParams, UserInterface, Utils, $ionicScrollDelegate, $ionicLoading, $document) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.details = {};
            $scope.errors = [];
            $scope.btnClass = 'btn-hidden';
            if (typeof $stateParams.itemId != "undefined") {
                $scope.details = UserInterface.getAppointmentById($stateParams.itemId);
                $scope.editDates = Utils.calculateDays($scope.details.date);
                $scope.errors = [];
                scrollToCurrent();
                loadAvailableTimes();
            } else {
                $scope.errors = ['Нещо се обърка при отваряне на детаилите за тази поръчка!']
            }
        });
        $scope.onScroll = function () {
            var scr = $ionicScrollDelegate.$getByHandle('dates-delagate');
            var left = scr.getScrollPosition().left;
            left += 165;
            var index = parseInt(left / 55);
            if ((index > -1 && index < $scope.editDates.dates.length) && $scope.currentMonth != $scope.editDates.dates[index].month) {
                $scope.currentMonth = $scope.editDates.dates[index].month;
                $scope.$apply();
            }
        };
        $scope.changeCurrentDate = function (index) {
            $scope.btnClass = 'btn-hidden';
            $scope.editDates.dates[$scope.editDates.current.index].current = false;
            $scope.editDates.current.index = index;
            $scope.editDates.dates[index].current = true;
            loadAvailableTimes();
        };
        $scope.pickTime = function (time, event) {
            $scope.time = time;
            $scope.btnClass = '';
            console.log('Event', $document, event);
            var times = $document[0].querySelectorAll('.times-container ul li')
            for (var ind in times) {
                if (times[ind].classList)
                    times[ind].classList.remove('active');
            }
            event.target.classList.add('active');
        };
        $scope.done = function (e) {
            console.log('Done');
            e.preventDefault();
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
            }).then(function (success) {
                var year = $scope.selectedDate.getFullYear();
                var month = $scope.selectedDate.getMonth()+1;
                if (month < 10) month = "0" + month;
                var day = $scope.selectedDate.getDate();
                if (day < 10) day = "0" + day;
                var dateToUpdate = year + "/" + month  + "/" + day + " " + $scope.time;
                $scope.details.date = dateToUpdate;

                UserInterface.updateAppointment($scope.details).then(function (success) {
                    //success
                    $scope.errors = [];
                    $ionicLoading.hide().then(function () {
                        $state.go('home');
                    });
                }, function (errors) {
                    //error
                    $ionicLoading.hide();
                    $scope.errors = errors;

                })
            }, function (error) {
            })
        };
        function scrollToCurrent() {
            var scr = $ionicScrollDelegate.$getByHandle('dates-delagate');
            console.log('Scroll delagate', scr, $scope.editDates.current * 55);
            scr.scrollTo((parseInt($scope.editDates.current.index) * 55) - 165, 0, true)
        }

        function loadAvailableTimes() {
            $scope.times = [];
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
            }).then(function () {

                UserInterface.getTimesForDate($scope.editDates.dates[$scope.editDates.current.index].object, $scope.details.id).then(function (times) {
                    //success
                    $scope.selectedDate = $scope.editDates.dates[$scope.editDates.current.index].object;
                    $ionicLoading.hide();
                    $scope.times = times;
                    $scope.errors = [];

                }, function (errors) {
                    //error
                    $ionicLoading.hide();
                    $scope.errors = errors;

                });
            })
        }

    }])
    .controller('reservePersonCtrl', ['$scope', '$state', '$stateParams', 'UserInterface', 'Utils', function ($scope, $state, $stateParams, UserInterface, Utils) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            //do stuff before enter
            if (!UserInterface.isLoggedIn()) {
                $scope.currentUser = null;
                $state.go('login');
            } else {
                $scope.currentUser = UserInterface.getUser();
                $scope.vendorImage = $scope.currentUser.vendor.logo;
                $scope.userImage = $scope.currentUser.user.image;

            }
        });
        $scope.activateClass = '';
        $scope.form = {
            searchField: ''
        };
        var fullClientsList = null;
        $scope.currentClient = {
            id: 0,
            name: 'Гост'
        };
        var doNotFilterListOnUpdate = false;
        $scope.$watch('form.searchField', function () {
            if ($scope.form.searchField.length > 0) {
                $scope.activateClass = 'activate';
                filterClientsAndUpdate();
            } else {
                $scope.activateClass = '';
                filterClientsAndUpdate();
            }
        });
        //load client list
        UserInterface.getClients().then(function (clients) {
            //success
            console.log('Get Clients');
            $scope.fullClientsList = clients;
            filterClientsAndUpdate();
            $scope.hideSpinner = true;
            $scope.errors = [];
        }, function (err) {
            console.log('Error getting Clients');
            $scope.hideSpinner = true;
            $scope.errors = [err];
        });
        //select a client
        $scope.chooseClient = function (id) {
            $scope.currentClient.id = id;
            for (var ind in $scope.list) {
                if ($scope.list[ind].id == id) {
                    $scope.list[ind].class = 'current-client';
                    $scope.currentClient.name = $scope.list[ind].name;
                } else {
                    $scope.list[ind].class = '';
                }
            }
            if ($scope.currentClient.id != 0) {
                doNotFilterListOnUpdate = true;
                $scope.form.searchField = $scope.currentClient.name;
            }
        };
        //filter clients list when user searches
        function filterClientsAndUpdate() {
            if (!doNotFilterListOnUpdate) {
                var clientName = ($scope.form.searchField != null && $scope.form.searchField != "") ? $scope.form.searchField : 'Гост';
                $scope.currentClient = {
                    id: 0,
                    name: clientName
                };
                $scope.chooseClient(0);
                if ($scope.form.searchField.length == 0) {
                    if ($scope.fullClientsList != null && $scope.fullClientsList.length > 0) $scope.list = JSON.parse(JSON.stringify($scope.fullClientsList));
                } else {

                    var tmpList = $scope.fullClientsList.filter(function (el) {
                        return el.name.toLowerCase().indexOf($scope.form.searchField.toLowerCase()) == 0
                    });
                    $scope.list = tmpList.concat($scope.fullClientsList.filter(function (el) {
                        return el.name.toLowerCase().indexOf($scope.form.searchField.toLowerCase()) > 0
                    }))
                }
            }
            doNotFilterListOnUpdate = false;

        }
    }])
    .controller('reserveProcedureCtrl', ['$scope', '$state', '$stateParams', 'UserInterface', function ($scope, $state, $stateParams, UserInterface) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            //do stuff before enter
            if (!UserInterface.isLoggedIn()) {
                $scope.currentUser = null;
                $state.go('login');
            } else {
                $scope.currentUser = UserInterface.getUser();
                $scope.vendorImage = $scope.currentUser.vendor.logo;
                $scope.userImage = $scope.currentUser.user.image;
                $scope.currentClient = {
                    id: $stateParams.clientId,
                    name: $stateParams.clientName
                }
            }
        });
        $scope.activateClass = '';
        $scope.form = {
            searchField: ''
        };
        $scope.fullProcedureList = null;
        $scope.currentProcedure = {
            id: 0,
            name: ''
        };

        var doNotFilterListOnUpdate = false;
        $scope.$watch('form.searchField', function () {
            if ($scope.form.searchField.length > 0) {
                $scope.activateClass = 'activate';
                filterClientsAndUpdate();
            } else {
                $scope.activateClass = '';
                filterClientsAndUpdate();
            }
        });
        //load client list
        UserInterface.getProcedures().then(function (procedures) {
            //success
            $scope.fullProcedureList = procedures;
            filterClientsAndUpdate();
            $scope.hideSpinner = true;
            $scope.errors = [];
        }, function (err) {
            console.log('Error getting Clients');
            $scope.hideSpinner = true;
            $scope.errors = [err];
        });
        //select a client
        $scope.chooseProcedure = function (id) {
            $scope.currentProcedure.id = id;
            for (var ind in $scope.list) {
                if ($scope.list[ind].id == id) {
                    $scope.list[ind].class = 'current-procedure';
                    $scope.currentProcedure.name = $scope.list[ind].name;
                    $scope.currentProcedure.duration = $scope.list[ind].duration;
                } else {
                    $scope.list[ind].class = '';
                }
            }
            if ($scope.currentProcedure.id != 0) {
                doNotFilterListOnUpdate = true;
                $scope.form.searchField = $scope.currentProcedure.name;
            }
        };
        //filter clients list when user searches
        function filterClientsAndUpdate() {
            if (!doNotFilterListOnUpdate) {
                //$scope.currentProcedure = {
                /*$scope.currentClient = {
                    id: 0,
                    name: 'Гост'
                };*/
                $scope.chooseProcedure(0);
                if ($scope.form.searchField.length == 0) {
                    $scope.list = JSON.parse(JSON.stringify($scope.fullProcedureList));
                } else {

                    var tmpList = $scope.fullProcedureList.filter(function (el) {
                        return el.name.toLowerCase().indexOf($scope.form.searchField.toLowerCase()) == 0
                    });
                    $scope.list = tmpList.concat($scope.fullProcedureList.filter(function (el) {
                        return el.name.toLowerCase().indexOf($scope.form.searchField.toLowerCase()) > 0
                    }))
                }
            }
            doNotFilterListOnUpdate = false;

        }

    }])
    .controller('reserveDateCtrl', ['$scope', '$state', '$stateParams', 'UserInterface', 'Utils', '$ionicScrollDelegate', '$ionicLoading', '$document', '$ionicHistory', function ($scope, $state, $stateParams, UserInterface, Utils, $ionicScrollDelegate, $ionicLoading, $document, $ionicHistory) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            //do stuff before enter
            if (!UserInterface.isLoggedIn()) {
                $scope.currentUser = null;
                $state.go('login');
            } else {
                $scope.currentUser = UserInterface.getUser();
                $scope.vendorImage = $scope.currentUser.vendor.logo;
                $scope.userImage = $scope.currentUser.user.image;
                $scope.currentProcedure = {
                    id: $stateParams.procedureId,
                    duration: $stateParams.procedureDuration
                };
                $scope.currentClient = {
                    id: $stateParams.clientId,
                    name: $stateParams.clientName
                }

                $scope.errors = [];
                $scope.btnClass = 'btn-hidden';
                $scope.editDates = Utils.calculateDays(new Date());
                scrollToCurrent();
                loadAvailableTimes();
            }
        });

        $scope.onScroll = function () {
            var scr = $ionicScrollDelegate.$getByHandle('dates-delagate');
            var left = scr.getScrollPosition().left;
            left += 165;
            var index = parseInt(left / 55);
            if ((index > -1 && index < $scope.editDates.dates.length) && $scope.currentMonth != $scope.editDates.dates[index].month) {
                $scope.currentMonth = $scope.editDates.dates[index].month;
                $scope.$apply();
            }
        };
        $scope.changeCurrentDate = function (index) {
            $scope.btnClass = 'btn-hidden';
            $scope.editDates.dates[$scope.editDates.current.index].current = false;
            $scope.editDates.current.index = index;
            $scope.editDates.dates[index].current = true;
            loadAvailableTimes();
        };
        $scope.pickTime = function (time, event) {
            $scope.time = time;
            $scope.btnClass = '';
            console.log('Event', $document, event);
            var times = $document[0].querySelectorAll('.times-container ul li')
            for (var ind in times) {
                if (times[ind].classList)
                    times[ind].classList.remove('active');
            }
            event.target.classList.add('active');
        };
        $scope.save = function (e) {
            e.preventDefault();
            $ionicLoading.show({
                content: 'Saving',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,

            }).then(function (success) {
                var year = $scope.selectedDate.getFullYear();
                var month = $scope.selectedDate.getMonth()+1; if (month < 10) month = "0" + month;
                var day = $scope.selectedDate.getDate(); if (day < 10) day = "0" + day;

                UserInterface.createAppointment(day, month, year, $scope.time, $scope.currentClient, $scope.currentProcedure).then(function (success) {
                    //success
                    $scope.errors = [];
                    $ionicLoading.hide().then(function () {
                        $ionicHistory.clearCache().then(function(){ $state.go('home') });
                        //$state.go('home');
                    });
                }, function (errors) {
                    //error
                    $ionicLoading.hide();
                    $scope.errors = errors;

                })
            }, function (error) {

            })
        };

        function scrollToCurrent() {
            var scr = $ionicScrollDelegate.$getByHandle('dates-delagate');
            console.log('Scroll delagate', $scope.editDates);
            scr.scrollTo((parseInt($scope.editDates.current.index) * 55) - 165, 0, true)
        };
        function loadAvailableTimes() {
            $scope.times = [];
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,

            }).then(function () {

                UserInterface.getTimesForDate($scope.editDates.dates[$scope.editDates.current.index].object, $scope.currentProcedure.id, true).then(function (times) {
                    //success
                    $scope.errors = [];
                    $scope.selectedDate = $scope.editDates.dates[$scope.editDates.current.index].object;
                    $scope.times = times;
                    $ionicLoading.hide();


                }, function (errors) {
                    //error
                    $ionicLoading.hide();
                    $scope.errors = errors;

                });
            })
        };


    }])
    .controller('calendarCtrl', ['$scope', '$state', '$stateParams', 'UserInterface', 'Utils', '$ionicScrollDelegate', '$ionicLoading', '$document', '$interval', function ($scope, $state, $stateParams, UserInterface, Utils, $ionicScrollDelegate, $ionicLoading, $document, $interval) {
        "use strict";
        $scope.$on('$ionicView.beforeEnter', function () {
            //do stuff before enter
            if (!UserInterface.isLoggedIn()) {
                $scope.currentUser = null;
                $state.go('login');
            } else {
                $scope.currentUser = UserInterface.getUser();
                $scope.vendorImage = $scope.currentUser.vendor.logo;
                $scope.userImage = $scope.currentUser.user.image;
                $scope.editDates = Utils.calculateMonts();
                setTimeout(function () {
                    centerOnCurrent()
                }, 200)
                $scope.updateForCurrentTab();
            }
        });
        $scope.upcomingReservationTime = new Date();
        $scope.tabIndex = 0;
        $scope.dateSelected = new Date();// currently selected date by user
        $scope.showCalendar = false;// shows/hides the calendar

        $scope.onScroll = function () {
            // var scr = $ionicScrollDelegate.$getByHandle('dates-delagate');
            // var left = scr.getScrollPosition().left;
            // left += 165;
            // var index = parseInt(left / 55);
            // if ((index > -1 && index < $scope.editDates.dates.length) && $scope.currentMonth != $scope.editDates.dates[index].month) {
            //     $scope.currentMonth = $scope.editDates.dates[index].month;
            //     $scope.$apply();
            // }
        };
        $scope.changeCurrentMonth = function (index) {
            $scope.showCalendar = false;
            $scope.editDates.dates[$scope.editDates.current.index].current = false;
            $scope.editDates.current.index = index;
            $scope.editDates.dates[index].current = true;
            centerOnCurrent();
            $scope.updateForCurrentTab();
        };
        $scope.changeTab = function (index) {
            $scope.tabIndex = index;
            $scope.updateForCurrentTab();
        };
        function centerOnCurrent() {
            var scr = $ionicScrollDelegate.$getByHandle('months-delagate');

            //calculate item widths
            var doc = $document[0];
            var items = doc.querySelectorAll('ul.month-scroller li');
            var containerWIdth = doc.querySelector('ion-scroll.months-scroller') ? doc.querySelector('ion-scroll.months-scroller').clientWidth : 0;
            var scrollLeft = 100; // 100px for the left margin on the first element
            if (items.length > 1 && containerWIdth) {
                for (var ind in items) {
                    var item = items[ind];
                    scrollLeft += item.clientWidth;
                    if (ind == $scope.editDates.current.index) {
                        scrollLeft -= ((containerWIdth + item.clientWidth) / 2);
                        break;
                    }
                }
            }
            scr.scrollTo(scrollLeft, 0, true)
        };

        function centerOnCurrentDay() {
            var scr = $ionicScrollDelegate.$getByHandle('days-delagate');

            //calculate item widths
            var doc = $document[0];
            var items = doc.querySelectorAll('ul.days-scroller li');
            var containerWIdth = doc.querySelector('ion-scroll.days-scroller') ? doc.querySelector('ion-scroll.days-scroller').clientWidth : 0;
            var scrollLeft = 100; // 100px for the left margin on the first element
            if (items.length > 1 && containerWIdth) {
                for (var ind in items) {
                    var item = items[ind];
                    scrollLeft += item.clientWidth;
                    if (ind == $scope.editDays.current.index) {
                        scrollLeft -= ((containerWIdth + item.clientWidth) / 2);
                        break;
                    }
                }
            }
            scr.scrollTo(scrollLeft, 0, true)
        };

        $scope.updateForCurrentTab = function () {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 0,

            }).then(function () {

                UserInterface.getAppointmentsForMonth($scope.editDates.dates[$scope.editDates.current.index].object).then(function (appointments) {
                    //success
                    $scope.errors = [];
                    $scope.appointments = appointments;
                    switch ($scope.tabIndex) {
                        case 1://the single day tab
                            if ($scope.selectedDay == null) $scope.selectedDay = new Date();//if $scope.selectedDay is null, select for today;
                            var appointmentsForDay = Utils.getAppointmentsForDate($scope.selectedDay, $scope.appointments);

                            $scope.appForDay = Utils.prepareAppointmentsForDate(appointmentsForDay);
                            var activeDay = Utils.getExistingDate($scope.editDays, $scope.selectedDay);
                            if (activeDay != null) activeDay.current = true;
                            centerOnCurrentDay();
                            break;
                        case 0://the whole month calendar tab
                        default:
                            $scope.calendarArray = Utils.generateCalendar($scope.editDates.dates[$scope.editDates.current.index].object, $scope.appointments);
                            $scope.showCalendar = true;
                            $scope.editDays = Utils.getDaysWithAppointmentsForCurrentMonth(appointments);


                            UserInterface.getAppointments().then(function (appointments) {
                                //success
                                $scope.errors = [];
                                $scope.upcomingReservationTime = Utils.getUpcomingReservationTime(appointments);
                                var futureDate = $scope.upcomingReservationTime;
                                if ($scope.countdownTimer != null) $interval.cancel($scope.countdownTimer);
                                $scope.countdownTimer = $interval(function () {
                                    var future = new Date(futureDate);
                                    var diff;
                                    diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                                    $scope.upcomingReservationTimerHTML = Utils.dhms(diff);
                                }, 1000);
                            }, function (errors) {
                                //error
                                $scope.errors = errors;
                            });

                            break;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide();
                }, function (errors) {
                    //error
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide();
                    $scope.errors = errors;

                });
            });

        }

        $scope.getAppointmentsForCurrentDay = function (selectedDay) {
            if (selectedDay instanceof Object) $scope.selectedDay = selectedDay.date;
            else {
                $scope.selectedDay = $scope.editDays[selectedDay].object;
            }
            $scope.tabIndex = 1;
            $scope.updateForCurrentTab();
        }
    }])

 