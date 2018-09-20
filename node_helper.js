/* node_helper.js
 *
 * Magic Mirror module - Train & bus departures from the Skånetrafiken API (http://labs.skanetrafiken.se/api.asp). 
 * 
 * Magic Mirror
 * Module: MMM-SkanetrafikenSweden
 * 
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 * 
 * Module MMM-SkanetrafikenSweden By Lee Embrin
 * 
 * Notifications:
 *      CONFIG: Sent to update any listeners of the current configuration.
 *      NEW_DEPARTURE: Received when a new feed is available.
 *      SERVICE_FAILURE: Received when the service access failed.
 *
 * API Example response
 *      Deviations: [""]
 *      IsTimingPoint: ["false"]
 *      JourneyDateTime: ["2018-08-11T14:03:00"]
 *      LineTypeId: ["4"]
 *      LineTypeName: ["Stadsbuss"]
 *      Name: ["6"]
 *      No: ["6"]
 *      RealTime: [{…}]
 *      RunNo: ["264"]
 *      StopPoint: ["B"]
 *      Towards: ["Klagshamn via Värnhem"]
 *      TrainNo: ["0"]
 */
const NodeHelper = require("node_helper");
const request = require("request-promise");
const nodeSkanetrafiken = require('node-skanetrafiken');

module.exports = NodeHelper.create({
    // --------------------------------------- Start the helper
    start: function() {
        console.log('Starting helper: '+ this.name);
        this.started = false;
    },

    // --------------------------------------- Schedule a feed update
    scheduleUpdate: function() {
        var self = this;
        this.updatetimer = setInterval(function() { // This timer is saved in uitimer so that we can cancel it
            self.getFeed();
        }, self.config.updateInterval);
    },

    // --------------------------------------- Get the feed
    getFeed: function() {
        var self = this;

        nodeSkanetrafiken.getDepartures({ stopID: self.config.stationId }, function(results, err) {
           // Do something with the results
            if(results) {
                self.sendSocketNotification('NEW_DEPARTURE', results);
            }
            if(err) {    
                self.sendSocketNotification('SERVICE_FAILURE', err);
            }
        });
    },
    
    // --------------------------------------- Handle notifications
    socketNotificationReceived: function(notification, payload) {
        const self = this;
        if (notification === 'CONFIG' && this.started == false) {
		    this.config = payload;	     
		    this.started = true;
		    self.scheduleUpdate();
            self.getFeed(); // Get it first time
        };
    }

});
