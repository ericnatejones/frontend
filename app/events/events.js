'use strict';

angular.module('myApp.events', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/events', {
            templateUrl: 'events/events.html',
            controller: 'EventsCtrl'
        });
    }])

    .controller('EventsCtrl', ['$scope', '$compile', 'uiCalendarConfig', 'Restangular', function ($scope, $compile, uiCalendarConfig, Restangular) {


        $scope.eventSources = [];
        /* config object */
        Restangular.all('events').getList().then(function (data) {
            for (var eventIndex = 0; eventIndex < data.length; eventIndex++) {
                var event = data[eventIndex];
                $scope.events.push(event);
            }
        });
        $scope.events = [];


        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();


        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
        };
        /* event source that contains custom events on the scope */
        //$scope.events = [
        //  {title: 'All Day Event',start: "2015-02-11"},
        //  {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
        //  {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
        //  {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
        //  {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
        //  {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        //];
        /* event source that calls a function on every view switch */
        $scope.eventsF = function (start, end, timezone, callback) {
            var s = new Date(start).getTime() / 1000;
            var e = new Date(end).getTime() / 1000;
            var m = new Date(start).getMonth();
            var events = [{
                title: 'Feed Me ' + m,
                start: s + (50000),
                end: s + (100000),
                allDay: false,
                className: ['customFeed']
            }];
            callback(events);
        };

        $scope.calEventsExt = {
            color: '#f00',
            textColor: 'yellow',
            events: [
                {
                    type: 'party',
                    title: 'Lunch',
                    start: new Date(y, m, d, 12, 0),
                    end: new Date(y, m, d, 14, 0),
                    allDay: false
                },
                {
                    type: 'party',
                    title: 'Lunch 2',
                    start: new Date(y, m, d, 12, 0),
                    end: new Date(y, m, d, 14, 0),
                    allDay: false
                },
                {
                    type: 'party',
                    title: 'Click for Google',
                    start: new Date(y, m, 28),
                    end: new Date(y, m, 29),
                    url: 'http://google.com/'
                }
            ]
        };
        /* alert on Drop */
        $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            //$scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
            //save new date to database

            var eventCopy = angular.copy(event);

            var day = eventCopy.start.getDate();
            var month = eventCopy.start.getMonth() + 1;
            var year = eventCopy.start.getFullYear();

            eventCopy.start = year + '-' + month + '-' + day

            Restangular.all('events/' + event.id).customPUT(eventCopy).then(function () {
                    //alert("Event date was changed successfully!");
                    $location.path('/events');
                },
                function () {
                    //alert("There was a problem")
                })
        };

        //change title

        $scope.alertOnEventClick = function (event, delta, date, jsEvent, view) {


            var newTitle = prompt('new title');

            var eventCopy = angular.copy(event);

            eventCopy.title = newTitle;

            //eventCopy.title = newTitle

            Restangular.all('events/' + event.id).customPUT(eventCopy).then(function () {
                    alert("Event title was changed successfully!");
                    $location.path('/events' + event.id);
                },
                function () {
                    alert("There was a problem")
                })




        };
        /* alert on Resize */
        $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };
        /* add and removes an event source of choice */
        $scope.addRemoveEventSource = function (sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function (value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };
        /* add custom event*/
        $scope.addEvent = function () {
            var day = prompt("which day would you like the event to be on?");

            if (Math.floor(day) == day && $.isNumeric(day) && day <32)  {
                var newTitle = prompt("what would you like as your new title");
            }else{
                alert("day needs to be an integer and a date on the calendar");
                return

            }

            var event = {

                title: newTitle,
                start: new Date(y, m, day)
                //end: new Date(y, m, day),
                //className: ['openSesame']
            };

            $scope.events.push(event);


            //$scope.events.push(event);

            //newEvent.title =


            var eventCopy = angular.copy(event);

            eventCopy.title = newTitle;
            eventCopy.start = y + '-' + m + '-' + day;

            Restangular.one('events/').customPOST(eventCopy).then(function (postedEvent) {
                    alert("Event title was changed successfully!");
                    //$location.path('/events');
                },
                function () {
                    alert("There was a problem")
                })

        };
        /* remove event */
        $scope.remove = function (index) {
            $scope.events.splice(index, 1);
        };
        /* Change View */
        $scope.changeView = function (view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };
        /* Change View */
        $scope.renderCalender = function (calendar) {
            if (uiCalendarConfig.calendars[calendar]) {
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        };
        /* Render Tooltip */
        $scope.eventRender = function (event, element, view) {
            element.attr({
                'tooltip': event.title,
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        };
        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: 600,
                editable: true,
                selectable: true,
                select: function(start, end) {
                    var title = prompt('Event Title:');
                    var eventData;
                    if (title) {
                        eventData = {
                            title: title,
                            start: start,
                            end: end
                        };
                    }
                },
                header: {
                    left: 'month agendaDay',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender
            }
        };
        //clicking a day to add event
        $scope.onReportDayClick = function (event, delta, date, jsEvent, view) {
            alert("you clicked a day")
        }

        /* event sources array*/
        $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
        $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];


    }]);