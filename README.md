# MMM-SkanetrafikenSweden

Magic Mirror Module: MMM-SkanetrafikenSweden This module for the Magic Mirror² lists the departures from a specified bus stop using Skånetrafikens API.

## Installation

1.  Clone this repository in your modules folder, and install dependencies:
	- cd ~/MagicMirror/modules # adapt directory if you are using a different one
	- git clone  [https://github.com/zaptorrent/MMM-SkanetrafikenSweden.git](https://github.com/zaptorrent/MMM-SkanetrafikenSweden.git)
	- cd MMM-SkanetrafikenSweden
	- npm install
2.  Add the module to your config/config.js file.
    

		{
			module: 'MMM-SkanetrafikenSweden',
			config:  {
				updateInterval: 10*60*1000,     // Optional. Number of ms between API updates. 
				uiUpdateInterval: 10*1000,      // Optional. Number of ms between updating UI. 
				oldest: 30,                     // Optional. Dont show departures further away than this number of minutes.
				maxResults: 6,                  // Optional. Max no of results to show. Can't be more than 50.
				stationId: "80915",             // Required. The id of the stop you want to monitor. Find your id: 
												// http://www.labs.skanetrafiken.se/v2.2/querystation.asp?inpPointfr=hyllie 
												// (change "hyllie" in url to the name of your stop). 
			},
		},
