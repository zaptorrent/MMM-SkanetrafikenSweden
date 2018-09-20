/* MMM-SkanetrafikenSweden.js
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
Module.register("MMM-SkanetrafikenSweden", {
    // --------------------------------------- Define module defaults
    defaults: {
        updateInterval: 10*60*1000,     // Optional. Number of ms between API updates. 
        uiUpdateInterval: 10*1000,      // Optional. Number of ms between updating UI. 
        oldest: 30,                     // Optional. Dont show departures further away than this number of minutes.
        maxResults: 10,                 // Optional. Max no of results to show. Can't be more than 50.
        stationId: "80000",             // Required. The id of the stop you want to monitor. Find your id: 
                                        // http://www.labs.skanetrafiken.se/v2.2/querystation.asp?inpPointfr=hyllie 
                                        // (change "hyllie" in url to the name of your stop). 
    },
    
    // --------------------------------------- Define required scripts
    getScripts: function() {
		return ['moment.js'];
	},

    // --------------------------------------- Start the module
    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale.
        moment.locale(config.language);

        this.loaded = false;
        this.sendSocketNotification('CONFIG', this.config); // Send config to helper and initiate an update
        this.currentFeedIndex = 0;

        // Start timer for ui-updates
        var self = this;
        this.uitimer = setInterval(function() { // This timer is saved in uitimer so that we can cancel it
            self.updateDom();
        }, self.config.uiUpdateInterval);
    },

    // --------------------------------------- Generate dom for module
    getDom: function() {
        var self = this;
        var wrapper = document.createElement("div");

        // ----- Show info if we haven't had any response yet
        if (!this.loaded) {
			wrapper.innerHTML = this.name + " loading departures ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

        // ----- Show departures
        var maxTime = moment().add(self.config.oldest,"m").valueOf(),
            between = false,
            now = new Date();
        
        self.currentFeed.forEach(function(msg,i){           
            deptTime = new Date(msg.JourneyDateTime[0]);
            between = moment(deptTime).isBetween(now, maxTime);
            
            // Filter out the departures to display
            if (between && (i<self.config.maxResults)) {
                var ddiv = document.createElement("div");
                ddiv.className = 'dimmed xsmall';
                ddiv.innerHTML = msg.LineTypeName[0] + " " + msg.Name[0] + " towards " + msg.Towards[0] + " " + moment(msg.JourneyDateTime[0]).fromNow();
                wrapper.appendChild(ddiv);
            }
        });

        // ----- Show service failure if any
        if (this.failure !== undefined) {
            var div = document.createElement("div");
            div.innerHTML = "Service: "+this.failure.StatusCode + '-' + this.failure.Message;
            div.style.color = "red"; // TODO Change this to a custom style
            wrapper.appendChild(div);
        }

        return wrapper;
    },

    // --------------------------------------- Debug output
    debug: function(msg) {
        if (this.config.debug) console.log(this.name + ': ' + msg);
    },
    
    // --------------------------------------- Handle socketnotifications
    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEW_DEPARTURE") {
            this.loaded = true;
            this.failure = undefined;
            // Handle payload
            this.currentFeed = payload;
            Log.info("Departures updated: "+ this.currentFeed.length);
            this.updateDom();
        }
        if (notification == "SERVICE_FAILURE") {
            this.failure = payload;
            Log.info("Service failure: "+ this.failure.StatusCode + ':' + this.failure.Message);
            this.updateDom();
        }
    },

})
