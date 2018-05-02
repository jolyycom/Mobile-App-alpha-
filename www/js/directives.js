angular.module('app.directives', [])

    .filter('toBadgeDate', [function () {
        "use strict";
        return function (input) {
            var monthNames = [
                'яну',
                'фев',
                'мар',
                'апр',
                'май',
                'юни',
                'юли',
                'авг',
                'сеп',
                'окт',
                'ное',
                'дек'
            ];
            var date = new Date(input);
            var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            var html = '';
            html += '<span class="badge-day">' + day + '</span>';
            html += '<span class="badge-month">' + monthNames[date.getMonth()] + '</span>';
            return html;
        }
    }])
    .filter('toBadgeHour', [function () {
        "use strict";
        return function (input) {
            var date = new Date(input);
            var hours = date.getHours()<10 ? '0'+date.getHours() : date.getHours();
            var minutes = date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes();
            return hours + ':' + minutes;
        }
    }]).filter('orDefaultImage', [function () {
        "use strict";
        return function (input) {
            console.log('Got image input ', input);
           return input || '/img/def-prof.png'
        }
    }]);