angular.module('app.factories', [])
    .factory('appointmentsFactory', function () {
        "use strict";
        var AppointmentFactory = function () {
            if (!(this instanceof AppointmentFactory)) {
                return new AppointmentFactory();
            }
            this.appointments = [
                {
                    id: 1,
                    name: 'Дамско подстригване',
                    description: 'Дамско подстригване  специалист с измиване с шампоан L`Oreal и посдсушаване.',
                    date: '2017-04-05 15:20', // yyyy-MM-dd HH:mm:ss
                    duration: '15min',
                    client: 'Мелания Тръмп',
                    clientImage: '/img/prof-pic.jpg',// MUST BE ABSOLUTE URL
                    categories: [{
                        name: 'лице',
                        icon: 'j-face'
                    }] //array of category objects. Max two
                },
                {
                    id: 2,
                    name: 'Дамско подстригване, измиване и сешоар',
                    description: 'Дамско подстригване от специалист с измиване с шампоан L`Oreal и посдсушаване.',
                    date: '2017-04-06 15:35', // MM/dd/YYYY hh:mm
                    duration: '15min',
                    client: 'Мелания Тръмп',
                    clientImage: '',// MUST BE ABSOLUTE URL
                    categories: [{
                        name: 'лице',
                        icon: 'j-face'
                    }, {
                        name: 'коса',
                        icon: 'j-hair'
                    }] //array of category objects. Max two
                },
                {
                    id: 3,
                    name: 'Дамско подстригване от специалист с измиване с шампоан L`Oreal',
                    description: 'Дамско подстригване от специалист с измиване с шампоан L`Oreal и посдсушаване.',
                    date: '2017-04-06 16:45', // MM/dd/YYYY hh:mm
                    duration: '38min',
                    client: 'Мелания Тръмп',
                    clientImage: '',// MUST BE ABSOLUTE URL
                    categories: [{
                        name: 'лице',
                        icon: 'j-face'
                    }] //array of category objects. Max two
                },
                {
                    id: 4,
                    name: 'Дамско подстригване от специалист с измиване с шампоан L`Oreal и посдсушаване.',
                    description: 'Дамско подстригване от специалист с измиване с шампоан L`Oreal и посдсушаване.',
                    date: '2017-04-07 17:00', // MM/dd/YYYY hh:mm
                    duration: '68min',
                    client: 'Мелания Тръмп',
                    clientImage: '',// MUST BE ABSOLUTE URL
                    categories: [{
                        name: 'Тяло',
                        icon: 'j-body'
                    }] //array of category objects. Max two
                }
            ];
            this.times = ['9:30', '9:55', '10:10', '10:30', '10:55', '11:10', '11:30', '11:55', '12:10', '12:30', '12:55', '13:10', '13:30', '13:55', '14:10', '14:30', '14:55',]
            this.get = function () {
                return this.appointments;
            };
            this.cancel = function (id) {
                this.appointments = this.appointments.filter(function (el) {
                    return el.id != id;
                });
                return this.appointments;
            };
            this.getTimes = function () {
                return this.times;
            };
            return this;
        };

        return AppointmentFactory();
    })
    .factory('ClientsFactory', function () {
        "use strict";
        var clients = [
            {
                id: 1,
                name: 'Мелания Тръмп'
            }, {
                id: 2,
                name: 'Иванка Тръмп'
            }, {
                id: 3,
                name: 'Montley Crew'
            }, {
                id: 4,
                name: 'Иван Иванов'
            }, {
                id: 5,
                name: 'Петър Гиоргиев'
            }, {
                id: 6,
                name: 'Михаил Петров'
            }
        ];
        return {
            get: function () {
                return clients;
            }
        }
    })
    .factory('ProceduresFactory', function () {
        var procedures = [
            {
                id: 1,
                name: 'Дамско подстригване',
                duration:'20min',
                cost:'1лв.',
                categories: [{
                    name: 'коса',
                    icon: 'j-hair'
                }] //array of category objects. Max two
            }, {
                id: 2,
                name: 'Мъжко подстригване',
                duration:'20min',
                cost:'1лв.',
                categories: [{
                    name: 'коса',
                    icon: 'j-hair'
                }] //array of category objects. Max two
            }, {
                id: 3,
                name: 'Масаж на цяло тяло',
                duration:'20min',
                cost:'1лв.',
                categories: [{
                    name: 'тяло',
                    icon: 'j-body'
                }, {
                    name: 'лице',
                    icon: 'j-face'
                }] //array of category objects. Max two
            }

        ];
        return {
            get: function () {
                "use strict";
                return procedures;
            }
        }
    });