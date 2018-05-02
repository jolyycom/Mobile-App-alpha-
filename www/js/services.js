angular.module('app.services', [])
    .service('UserInterface', ['$q', 'appointmentsFactory', 'ClientsFactory', 'ProceduresFactory', '$http', '$ionicPlatform', '$state', function ($q, appointmentsFactory, ClientsFactory, ProceduresFactory, $http, $ionicPlatform, $state) {
        "use strict";
        //hardcoded user to compare
        var u = {
            vendor: 'jolyy',
            username: 'me',
            password: 'jolyy'
        };
        //harcoded user object to be returned from future API
        var res = {
            success: true,
            token: 'long_ass_token_string',
            vendor: {
                username: 'jolyy',
                name: 'Jolly',
                logo: 'img/vendor-pic.jpg'
            },
            user: {
                username: 'me',
                name: 'Аз',
                image: 'img/prof-pic.jpg'
            }
        };
        //hardcoded error response
        var errorObject = {
            success: false,
            errors: [
                'Невалидно потребителско име',
                'Невалидно име на салон',
            ]
        };

        //PushNotification Service
        var pushNotifyService = null;

        // API Endpoints
        //var apiURL = "http://localhost/jolyy/wp-json/wp/v2/";
        var apiURL = "http://jolyy.bg/wp-json/wp/v2/";
        var endpointLogin = "mobile_login/";
        var endpointLogout = "logout/";
        var endpointIsValidToken = "is_valid_token/";
        var endpointGetAppointments = "get_appointments/";
        var endpointGetAppointmentsForMoth = "get_appointments_for_month/";
        var endpointGetAppointment = "get_appointment/";
        var endpointCancelAppointment = "cancel_appointment/";
        var endpointGetTimeBlocksForDate = "get_time_blocks_for_date/";
        var endpointCreateAppointment = "create_appointment/";
        var endpointUpdateAppointment = "update_appointment/";
        var endpointGetClients = "get_clients/";
        var endpointGetProcedures = "get_procedures/";
        var endpointGetAppointmentNotes = "get_appointment_notes/";
        var endpointCreateAppointmentNote = "create_appointment_note/";
        var endpointDeleteAppointmentNote = "delete_appointment_note/";

        //==============
        //Private variables
        var cacheStringKey = 'JolyYCacheKeyStRinG#@';
        var userObject = null;
        return {
            appointments: null,
            login: function (userCredentials) {
                var defered = $q.defer();
                var valid = this.validate(userCredentials);
                var _self = this;
                if (valid.success) {
                    var config = [];
                    config.params = {
                        "beauty_studio" : userCredentials.vendor,
                        "user_name" : userCredentials.name,
                        "user_password" : userCredentials.password,
                    };
                    $http.get(apiURL + endpointLogin, config).then(
                        function ( result) {
                            if (result.data.errors.length > 0){defered.reject([result.data.errors]);return;}
                            userObject = result.data;
                            _self.saveUser();
                            defered.resolve(result.data)
                        },
                        function ( error) {
                           defered.reject([error]);
                        });
                } else {
                    defered.reject(valid.errorMessages);
                }
                return defered.promise;
            },

            scheduleLocalNotification: function (pushNotification) {
                var _self = this;

                window.cordova.plugins.notification.local.on("click", function (notification) {
                    if (_self.isLoggedIn()) {
                        var booking_id = data.booking_id;
                        if (booking_id != null) {
                            _self.getAppointments().then(function (data) {
                                //make redirect
                                $state.go("item-details", {itemId: booking_id})
                            });
                        }
                    }
                });

                var params = {
                    id: 1,
                    title: pushNotification.title,
                    text: pushNotification.message,
                    icon: pushNotification.image,
                    //at: tomorrow_at_8_45_am,
                    data: pushNotification.additionalData
                };
                window.cordova.plugins.notification.local.schedule(params);
            },

            startPushNotificationService: function () {
                var defered = $q.defer();
                var valid = false
                var _self = this;
                    if (userObject != null && userObject.token != null && userObject.pushNotifyService == null) {
                        var config = [];
                        config.params = {
                            "user_token": userObject.token,
                        };
                        $http.get(apiURL + endpointIsValidToken, config).then(
                            function (result) {
                                if (result.data.errors.length > 0) {
                                    defered.reject([result.data.errors]);
                                    return;
                                }
                                if (result.data.is_valid) {
                                    var pushServiceURL = "http://jolyy.bg/push/";
                                    userObject.pushNotifyService = PushNotification.init({
                                        android: {
                                            senderID: "359170935908",
                                            alert: "true",
                                            badge: "true",
                                            sound: "true",
                                            forceShow: "true"
                                        },
                                        ios: {
                                            alert: "true",
                                            badge: "true",
                                            sound: "true",
                                        },
                                        windows: {}
                                    });

                                    userObject.pushNotifyService.on('registration', function (data) {
                                        var device_type = $ionicPlatform.is('ios') == true ? "ios" : "android";
                                        var config = [];
                                        config.params = {
                                            "channels_id": "1,2",
                                            "device_type": device_type,
                                            "device_token": data.registrationId,
                                            "user_id": result.data.bookable_resource_id,
                                        };
                                        $http.get(pushServiceURL + "savetoken/", config).then(
                                            function (result) {
                                                //alert("Token Registered");
                                            },
                                            function (error) {
                                                //alert("Error Registering Token!!");
                                            });
                                    });


                                    userObject.pushNotifyService.on('notification', function (data) {
                                        _self.setApplicationIconBadgeNumber(0);
                                        if (_self.isLoggedIn()) {
                                            var booking_id = data.additionalData.booking_id;
                                            if (booking_id != null) {
                                                _self.getAppointments().then(function (data) {
                                                    //make redirect
                                                    $state.go("item-details", {itemId: booking_id})
                                                });
                                            }
                                        }
                                        // data.message, // data.title, // data.count, // data.sound,// data.image,// data.additionalData
                                    });

                                    userObject.pushNotifyService.on('error', function (e) {
                                        //alert(e.message);
                                    });
                                    _self.setApplicationIconBadgeNumber(0);

                                }
                                defered.resolve(true);
                            },
                            function (error) {
                               defered.reject([error]);
                            });
                    }

                return defered.promise;
            },

            setApplicationIconBadgeNumber : function ( bCount ) {
                if (userObject.pushNotifyService != null) {
                    userObject.pushNotifyService.setApplicationIconBadgeNumber(function () {
                        console.log('setApplicationIconBadgeNumber' + bCount + ':success');
                    }, function () {
                        console.log('setApplicationIconBadgeNumber' + bCount + ':error');
                    }, bCount);
                }
            },
            ///is_valid_token
            logout: function () {
                var defered = $q.defer();
                var config = [];
                config.params = {
                    "user_token" : userObject.token,
                };
                $http.get(apiURL + endpointLogout, config).then(
                    function ( result) {
                        if (result.data.errors.length > 0){defered.reject([result.data.errors]);return;}
                        defered.resolve(result.data)
                    },
                    function ( error) {
                        defered.reject([error]);
                    });

                userObject = null;
                this.clearCache();

                return defered.promise;
            },
            validate: function (userCredentials) {
                var errorMessages = [];
                if (!userCredentials.vendor.length) {
                    errorMessages.push('Потребителско име на салон е задължително')
                }
                if (!userCredentials.name.length) {
                    errorMessages.push('Потребителско име на специалист е задължително')
                }
                if (!userCredentials.password.length) {
                    errorMessages.push('Парола за специалиста е задължителна')
                }
                return {
                    success: errorMessages.length == 0,
                    errorMessages: errorMessages
                }
            },
            isLoggedIn: function () {
                if (userObject == null) {
                    this.loadUser();
                }
                return userObject != null;
            },
            loadUser: function () {
                var cached = window.localStorage.getItem(cacheStringKey);
                if (cached != null) {
                    userObject = JSON.parse(cached);
                }
            },
            saveUser: function () {
                if (userObject != null) {
                    window.localStorage.setItem(cacheStringKey, JSON.stringify(userObject));
                }
            },
            clearCache: function () {
                window.localStorage.removeItem(cacheStringKey);
            },
            getUser: function () {
                return userObject;
            },
            getAppointments: function () {
                var defered = $q.defer();
                var _self = this;
                //window.cordova.plugins.notification.badge.clear();

                if (this.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                        "range" : 2, //Hardcoded for 2 months ahead
                        "only_upcoming" : "true", //get only upcoming appointments
                    };
                    $http.get(apiURL + endpointGetAppointments, config).then(
                        function (result) {
                            var appointments = [];
                            if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                            if (result.data.appointments) {
                                result.data.appointments.sort(function (a, b) {
                                    // Turn your strings into dates, and then subtract them
                                    // to get a value that is either negative, positive, or zero.
                                    return new Date(a.date) - new Date(b.date);
                                });
                                appointments = result.data.appointments;
                                _self.appointments = appointments;
                            }
                            defered.resolve(appointments);

                        },
                        function (error) {
                           defered.reject([error]);
                        });
                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            },
            getAppointmentById: function (id) {
                var appointment = this.appointments.filter(function (el) {
                    return el.id == id;
                });
                if (appointment.length > 0) {
                    return appointment[0];
                } else {
                    return null;
                }
            },
            cancelAppointment: function (id) {
                var defered = $q.defer();
                var config = [];
                config.params = {
                    "user_token" : userObject.token,
                    "booking_id" : id,
                };
                $http.get(apiURL + endpointCancelAppointment, config).then(
                    function (result) {
                        if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                        defered.resolve(true);
                    },
                    function (error) {
                       defered.reject([error]);
                    });
                return defered.promise;
            },
            getAppointmentNotes: function (appointment_id) {
                var defered = $q.defer();
                var _self = this;

                if (this.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                        "booking_id" : appointment_id,
                    };
                    $http.get(apiURL + endpointGetAppointmentNotes, config).then(
                        function (result) {
                            var appointments = [];
                            if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                            defered.resolve(result.data.order_notes);
                        },
                        function (error) {
                           defered.reject([error]);
                        });
                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            },
            getTimesForDate: function (date, booking_id, is_product) {
                var defered = $q.defer();
                var config = [];
                config.params = {
                    "user_token" : userObject.token,
                    "booking_id" : booking_id,
                    "wc_bookings_field_start_date_day" : date.getDate(),
                    "wc_bookings_field_start_date_month" : date.getMonth() + 1,//date.getMonth(),
                    "wc_bookings_field_start_date_year" : date.getFullYear(),
                    //"wc_bookings_field_start_date_time" : "",
                };
                if (is_product) config.params.product_id = booking_id;
                $http.get(apiURL + endpointGetTimeBlocksForDate, config).then(
                    function (result) {
                        if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                        defered.resolve(result.data.blocks);
                    },
                    function (error) {
                       defered.reject([error]);
                    });
                /*setTimeout(function () {
                    defered.resolve(appointmentsFactory.getTimes())
                }, 1000);*/
                return defered.promise;
            },
            getClients: function () {
                var defered = $q.defer();
                var _self = this;
                if (_self.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                    };
                    $http.get(apiURL + endpointGetClients, config).then(
                        function (result) {
                            if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                            _self.clients = result;
                            defered.resolve(result.data.clients);
                        },
                        function (error) {
                           defered.reject([error]);
                        });

                } else {
                    defered.reject(['You must be logged in to see your clients '])
                }
                return defered.promise;
            },
            getProcedures: function () {
                var defered = $q.defer();
                var _self = this;
                if (_self.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                    };
                    $http.get(apiURL + endpointGetProcedures, config).then(
                        function (result) {
                            if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                            _self.procedures = result.data.procedures;
                            defered.resolve(result.data.procedures);
                        },
                        function (error) {
                           defered.reject([error]);
                        });

                } else {
                    defered.reject(['You must be logged in to see your procedures '])
                }
                return defered.promise;
            },
            getAppointmentsForMonth:function (date){
                var defered = $q.defer();
                var _self = this;
                if (this.isLoggedIn()) {

                    var month = (date.getMonth() < 10) ? "0" + (date.getMonth() + 1)  : date.getMonth() + 1;
                    var day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
                    var dateFormatted = date.getFullYear() + "-" + month + "-" + day;
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                        "date" : dateFormatted
                    };

                    $http.get(apiURL + endpointGetAppointmentsForMoth, config).then(
                        function (result) {
                            if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                            _self.appointments = result.data.appointments;
                            defered.resolve(result.data.appointments);
                        },
                        function (error) {
                           defered.reject([error]);
                        });


                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            },

            createAppointment: function (day, month, year, time, currentClient, currentProcedure) {
                var defered = $q.defer();
                var _self = this;

                if (this.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                        "wc_bookings_field_start_date_day" : String(day),
                        "wc_bookings_field_start_date_month" : String(month),
                        "wc_bookings_field_start_date_year" : String(year),
                        "wc_bookings_field_start_date_time" : String(time),
                        "customer_id" : String(currentClient.id),
                        "customer_name" : String(currentClient.name),
                        "product_id": String(currentProcedure.id),
                        "wc_bookings_field_duration" : String(currentProcedure.duration)
                    };


                    $http.get(apiURL + endpointCreateAppointment, config).then(
                        function (result) {
                            if (result.data != null && result.data.errors != null && result.data.errors.length > 0) defered.reject([result.data.errors]);
                            defered.resolve(true);
                        },
                        function (error) {
                            var error_message = error.status != "-1" ? "error.data.message" : "";
                            defered.reject([error_message]);
                        });
                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            },

            createAppointmentNote: function (appointment_id, note_text) {
                var defered = $q.defer();
                var _self = this;

                if (this.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                        "booking_id": appointment_id,
                        "note_text" : note_text
                    };


                    $http.get(apiURL + endpointCreateAppointmentNote, config).then(
                        function (result) {
                            if (result.data != null && result.data.errors != null && result.data.errors.length > 0) defered.reject([result.data.errors]);
                            defered.resolve(true);
                        },
                        function (error) {
                            var error_message = error.status != "-1" ? "error.data.message" : "";
                            defered.reject([error_message]);
                        });
                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            },

            deleteAppointmentNote: function (note_id) {
                var defered = $q.defer();
                var _self = this;

                if (this.isLoggedIn()) {
                    var config = [];
                    config.params = {
                        "user_token" : userObject.token,
                        "note_id": note_id,
                    };


                    $http.get(apiURL + endpointDeleteAppointmentNote, config).then(
                        function (result) {
                            if (result.data != null && result.data.errors != null && result.data.errors.length > 0) defered.reject([result.data.errors]);
                            defered.resolve(true);
                        },
                        function (error) {
                            var error_message = error.status != "-1" ? "error.data.message" : "";
                            defered.reject([error_message]);
                        });
                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            },

            updateAppointment: function (details) {
                var defered = $q.defer();
                var _self = this;

                if (this.isLoggedIn()) {
                    var config = [];
                    details.user_token = userObject.token;
                    config.params = details;
                    $http.get(apiURL + endpointUpdateAppointment, config).then(
                        function (result) {
                            if (result.data.errors.length > 0) defered.reject([result.data.errors]);
                            defered.resolve(true);
                        },
                        function (error) {
                           defered.reject([error]);
                        });
                } else {
                    defered.reject(['You must be logged in to see your appointments '])
                }
                return defered.promise;
            }
        };
    }])
    .service('Utils', [function () {
        "use strict";
        return {
            months: ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'орктомври', 'ноември', 'декември'],
            weekDays: ['пон', 'вто', 'сря', 'чет', 'пет', 'съб', 'нед'],
            calculateDays: function (dateString) {
                var date = new Date(dateString);
                var dates = this.getDatesRange(this.addDays(date, -30), this.addDays(date, 60));
                var current = {}
                var result = [];
                for (var ind in dates) {
                    var d = dates[ind];
                    var isCurrent = this.compareDates(d, date);
                    var day = d.getDay() == 0 ? 6 : d.getDay() - 1;
                    result.push({
                        weekDay: this.weekDays[day],
                        date: d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
                        month: this.months[d.getMonth()],
                        current: isCurrent,
                        object: d
                    });
                    if (isCurrent) {
                        current.index = ind;
                    }
                }

                return {
                    current: current,
                    dates: result
                };

            },
            addDays: function (date, days) {
                var dat = new Date(date.valueOf());
                dat.setDate(dat.getDate() + days);
                return dat;
            },
            addMonths: function (date, months) {
                var dat = new Date(date.valueOf());
                dat.setMonth(dat.getMonth() + months);
                return dat;
            },
            getDatesRange: function (startDate, stopDate) {
                var dateArray = new Array();
                var currentDate = startDate;
                while (currentDate <= stopDate) {
                    dateArray.push(new Date(currentDate))
                    currentDate = this.addDays(currentDate, 1);
                }
                return dateArray;
            },
            compareDates: function (left, right) {
                if (left.getFullYear() == right.getFullYear()) {
                    if (left.getMonth() == right.getMonth()) {
                        if (left.getDate() == right.getDate()) {
                            return true;
                        }
                    }
                }
                return false;
            },
            compareMonths: function (left, right) {
                if (left.getFullYear() == right.getFullYear()) {
                    if (left.getMonth() == right.getMonth()) {
                            return true;
                    }
                }
                return false;
            },
            calculateMonts: function () {
                var today = new Date();
                var dates = this.getMonthsRange(this.addMonths(today, -2), this.addMonths(today, 5));
                var current = {};
                var result = [];
                for (var ind in dates) {
                    var d = dates[ind];
                    var isCurrent = this.compareMonths(d, today);
                    result.push({
                        weekDay: this.weekDays[d.getDay()],
                        date: d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
                        month: this.months[d.getMonth()],
                        current: isCurrent,
                        object: d
                    });
                    if (isCurrent) {
                        current.index = ind;
                    }
                }

                return {
                    current: current,
                    dates: result
                };
            },
            getMonthsRange: function (startDate, stopDate) {
                var dateArray = new Array();
                startDate.setDate(1); //set date to 01
                stopDate.setDate(1); //set date to 01
                var currentDate = startDate;
                while (currentDate <= stopDate) {
                    dateArray.push(new Date(currentDate));
                    currentDate = this.addMonths(currentDate, 1);
                }
                return dateArray;
            },
            generateCalendar:function (date,appointments){
                var month = date.getMonth();
                var today=new Date();
                var d = new Date(date.getFullYear(),date.getMonth());//get first day of the month
                var calendararray = [
                    [{},{},{},{},{},{}],// monday
                    [{},{},{},{},{},{}],//tuesday
                    [{},{},{},{},{},{}],//wednesday
                    [{},{},{},{},{},{}],//thursday
                    [{},{},{},{},{},{}],//friday
                    [{},{},{},{},{},{}],//saturday
                    [{},{},{},{},{},{}]//sunday
                ];
                var week = 0;
                do{//fill the array
                    var weekDay = d.getDay() == 0 ? 6 : d.getDay()-1;

                    calendararray[weekDay][week]={
                        date:new Date(d.valueOf()),
                        count:this.getAppointmentsCountForDate(d,appointments),
                        current: this.compareDates(today,d)
                    };
                    if(weekDay==6){
                        week++;
                    }
                    d = this.addDays(d,1);

                }while(month==d.getMonth());

                return calendararray;

            },

            getDaysWithAppointmentsForCurrentMonth: function (appointments) {
                var result = [];
                var _self = this;

                angular.forEach(appointments, function(appointment, key) {
                    if (!_self.isExistingDate(result, appointment.date) ){
                        var dateObject = new Date(appointment.date);
                        var dateFormatted = dateObject.getDate() < 10 ? '0' + dateObject.getDate() : dateObject.getDate();
                        dateFormatted += " " + _self.months[dateObject.getMonth()];
                        result.push(
                            {
                                date: dateFormatted,
                                //month: this.months[d.getMonth()],
                                current: false, //(dateObject.getDate() == selectedDay.getDate()),
                                object: dateObject
                            }
                        );
                    }
                });
                result.sort(function(a,b){
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return  a.object - b.object;//new Date(a.date)- new Date(b.date);
                });

                return result;
            },

            getUpcomingReservationTime: function (appointments) {
                var upcomingTime = null;
                var now = new Date();
                var _self = this;

                appointments.sort(function(a,b){
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return  new Date(a.date) - new Date(b.date);//new Date(a.date)- new Date(b.date);
                });

                angular.forEach(appointments, function(appointment, key) {
                    var appointmentDate = new Date(appointment.date);
                    if (now < appointmentDate && upcomingTime == null) upcomingTime = appointment.date;
                });

                return upcomingTime;
            },

            isExistingDate: function ( datesArr, dateToCheck ) {
                var searchedObject = this.getExistingDate(datesArr, dateToCheck);
                return (searchedObject != null);
            },

            getExistingDate: function ( datesArr, dateToCheck ) {
                var result = null;
                var dateToCheckObj = (dateToCheck instanceof Object ) ? dateToCheck : new Date (dateToCheck);
                var dateFormatted = dateToCheckObj.getDate() < 10 ? '0' + dateToCheckObj.getDate() : dateToCheckObj.getDate();
                dateFormatted += " " + this.months[dateToCheckObj.getMonth()],
                angular.forEach(datesArr, function(date, key) {
                    date.current = false; //Probable not the best place to reset it .... :)
                    if (date.date  == dateFormatted) result = date;
                });

                return result;
            },

            getAppointmentsCountForDate:function (date,appointments){
                return this.getAppointmentsForDate(date,appointments).length;
            },
            getAppointmentsForDate:function (date,appointments){
                var _self = this;
                var filteredAppointments = appointments.filter(function (el){
                    return _self.compareDates(date,new Date(el.date));
                });
                return filteredAppointments;

            },

            createEmptyTimeSegment: function (hours) {
                var _self = this;
                var timeSegment = [];

                    var objectRoundHour = _self.createTimeBlockObject("time", hours, 0, true);//  {class : "time", hours : hours, minutes : 0, timeLabel : hours + ":00", appointment : null};
                    var objectQuarterPart1 = _self.createTimeBlockObject("quarter", hours, 15, false);// {class : "quarter", hours : hours, minutes : 15, timeLabel : "", appointment : null};
                    var objectHalf = _self.createTimeBlockObject("half", hours, 30, false);// {class : "half", hours : hours, minutes : 30, timeLabel : "", appointment : null}
                    var objectQuarterPart2 = _self.createTimeBlockObject("quarter", hours, 45, false);//{class : "quarter", hours : hours, minutes : 45, timeLabel : "", appointment : null};

                    timeSegment.push(objectRoundHour);
                    timeSegment.push(objectQuarterPart1);
                    timeSegment.push(objectHalf);
                    timeSegment.push(objectQuarterPart2);

                return timeSegment;
            },

            prepareAppointmentsForDate: function (appointments){
                var result = [];
                var _self = this;
                var lastTimeBlock = null;

                appointments.sort(function(a,b){
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return  new Date(a.date)- new Date(b.date);
                });

                //loop each appointment to find the number of timeBlocks.  by hours
                var hoursArr = [];
                angular.forEach(appointments, function(appointment, key) {
                    var date = new Date(appointment.date);
                    var hoursRaw = date.getHours();
                    if (hoursArr.indexOf( hoursRaw ) == - 1 ) hoursArr.push(hoursRaw);
                });

                //create empty timeBlocks
                var timeObjectsCount = hoursArr.length;
                var counter = 1;
                angular.forEach(hoursArr, function(hours, key) {

                    /*
                    var objectRoundHour = _self.createTimeBlockObject("time", hours, 0, true);//  {class : "time", hours : hours, minutes : 0, timeLabel : hours + ":00", appointment : null};
                    var objectQuarterPart1 = _self.createTimeBlockObject("quarter", hours, 15, false);// {class : "quarter", hours : hours, minutes : 15, timeLabel : "", appointment : null};
                    var objectHalf =         _self.createTimeBlockObject("half", hours, 30, false);// {class : "half", hours : hours, minutes : 30, timeLabel : "", appointment : null}
                    var objectQuarterPart2 = _self.createTimeBlockObject("quarter", hours, 45, false);//{class : "quarter", hours : hours, minutes : 45, timeLabel : "", appointment : null};
                    */
                    var existingTimeBlock = _self.getExistingTimeBlock(result, hours, 0);
                    if (existingTimeBlock == null){
                        var timeSegment = _self.createEmptyTimeSegment(hours);
                        angular.forEach(timeSegment, function(timeObject, key) {
                            result.push(timeObject);
                        });

                        //Add 3 hours buffer ahead, if NOT last time object
                        if (counter < timeObjectsCount && hours < 20 ) {
                            timeSegment = _self.createEmptyTimeSegment(hours + 1);
                            angular.forEach(timeSegment, function (timeObject, key) {
                                result.push(timeObject);
                            });
                            timeSegment = _self.createEmptyTimeSegment(hours + 2);
                            angular.forEach(timeSegment, function (timeObject, key) {
                                result.push(timeObject);
                            });
                            timeSegment = _self.createEmptyTimeSegment(hours + 3);
                            angular.forEach(timeSegment, function (timeObject, key) {
                                result.push(timeObject);
                            });
                        }
                    }

                    counter++;
                    /*
                    result.push(objectRoundHour);
                    result.push(objectQuarterPart1);
                    result.push(objectHalf);
                    result.push(objectQuarterPart2);
                    */
                });

                angular.forEach(appointments, function(appointment, key) {
                    var date = new Date(appointment.date);
                    var hoursRaw = date.getHours();
                    var minutesRaw  = date.getMinutes();
                    //debugger;
                    var existingTimeBlock = _self.getExistingTimeBlock(result, hoursRaw, minutesRaw);

                    if (existingTimeBlock != null){
                        existingTimeBlock.appointment = appointment;
                        existingTimeBlock.noAppointmentClass = existingTimeBlock.noAppointmentClass.replace("empty-timeblock", "");//

                        var arrowTop = ""//
                        if (appointment.duration >= 20 && appointment.duration < 35)  arrowTop = "21%";
                        if (appointment.duration >= 35)  arrowTop = "33%";
                        existingTimeBlock.arrowTop = arrowTop;
                    }
                });

                /*var result = [
                    {
                        time: "09:00",
                        class: "time",
                        appointment: {
                            categories: [{id: 9, name: "Коса", icon: "j-hair"}],
                            client: "",
                            clientImage: "/img/prof-pic.jpg",
                            client_email: "",
                            client_id: "0",
                            date: "2017/05/01 11:40",
                            duration: "35",
                            id: 1187,
                            name: "Test 2"
                        }
                    },
                    {
                        time: "",
                        class: "quarter",
                        appointment: null
                    },
                    {
                        time: "",
                        class: "half",
                        appointment: null
                    },
                    {
                        time: "",
                        class: "quarter",
                        appointment: null
                    },
                    //////////////////////////
                    {
                        time: "10:00",
                        class: "time",
                        appointment: null
                    },
                    {
                        time: "",
                        class: "quarter",
                        appointment: {
                            categories: [{id: 9, name: "Коса", icon: "j-hair"}],
                            client: "",
                            clientImage: "/img/prof-pic.jpg",
                            client_email: "",
                            client_id: "0",
                            date: "2017/05/01 10:30",
                            duration: "35",
                            id: 1187,
                            name: "Test 2"
                        }
                    },
                    {
                        time: "",
                        class: "half",
                        appointment: {
                            categories: [{id: 9, name: "Коса", icon: "j-hair"}],
                            client: "",
                            clientImage: "/img/prof-pic.jpg",
                            client_email: "",
                            client_id: "0",
                            date: "2017/05/01 10:30",
                            duration: "35",
                            id: 1187,
                            name: "Test 2"
                        }
                    },
                    {
                        time: "",
                        class: "quarter",
                        appointment: null
                    },

                ]
                */

                return result;
            },

            createTimeBlockObject:function (cssClass, hours, minutes, addTimeLabel){
              var object =  {class : cssClass, hours : hours, minutes : minutes, timeLabel : "", appointment : null, noAppointmentClass : "empty-timeblock"};
              if (addTimeLabel) {
                  if (hours<10) hours = "0"+hours;
                  if (minutes<10) minutes = "0"+minutes;
                  object.timeLabel = hours + ":" + minutes;
              }
              return object;
            },

            getExistingTimeBlock: function ( timeBlocks, hours, minutes) {
                var result = null;
                if (minutes >= 0 && minutes < 15) minutes = 0;
                if (minutes >= 15 && minutes < 30) minutes = 15;
                if (minutes >= 30 && minutes < 45) minutes = 30
                if (minutes >= 45) minutes = 45

                angular.forEach(timeBlocks, function(timeBlock, key) {
                    if (timeBlock.hours == hours && timeBlock.minutes == minutes) result = timeBlock;
                });
                return result;
            },

            dhms: function(t) {
                var days, hours, minutes, seconds;
                days = Math.floor(t / 86400);
                t -= days * 86400;
                hours = Math.floor(t / 3600) % 24;
                var hoursLabel = hours + (days * 24);
                if (hoursLabel<10) hoursLabel = "0"+hoursLabel;
                t -= hours * 3600;
                minutes = Math.floor(t / 60) % 60;
                var minutesLabel = minutes;
                if (minutesLabel<10) minutesLabel = "0"+minutesLabel;
                t -= minutes * 60;
                seconds = t % 60;
                if (seconds<10) seconds = "0"+seconds;
                if (days>3)
                {
                    return "<div class='time-to-notimer'>Следвашата резервация е след " + days + " дни</div>";
                }
                else {
                //return [days + 'd', hours + 'h', minutes + 'm', seconds + 's'].join(' ');
                    return '<table> <tr> <th colspan="5" class="time-to-label">следващ час след:</th> </tr><tr> <td class="time-to-digit">' + hoursLabel + '</td><td class="time-to-digit time-to-separator">:</td><td class="time-to-digit">' + minutesLabel + '</td><td class="time-to-digit time-to-separator">:</td><td class="time-to-digit">' + seconds + '</td></tr><tr> <td class="time-to-label">часа</td><td></td><td class="time-to-label">мин</td><td></td><td class="time-to-label">сек</td></tr></table>';
                }
            }
        }
    }])