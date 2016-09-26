// Not using this package for updating the analytics data
// SyncedCron.options.collectionName = 'cronjobs';

// SyncedCron.add({
//     name: 'analytics data',
//     schedule: function(parser) {
//         return parser.text('every 1 minute'); // parser is a later.parse object
//     },
//     job: function() {
//
//     }
// // });

Meteor.startup(function() {
    // Start jobs
    // SyncedCron.start();

});

var googleapis = require('googleapis');
var JWT = googleapis.auth.JWT;
var analytics = googleapis.analytics('v3');
var analyticsreporting = googleapis.analyticsreporting('v4');
var googleKey = JSON.parse(Assets.getText('key.json'));
var Future = require('fibers/future');
var authClient = new JWT(
	googleKey.client_email,
	null,
	googleKey.private_key,
	['https://www.googleapis.com/auth/analytics.readonly'],
	null
);


// Methods
Meteor.methods({
	// Method to get ganalytics data of the profile id
	// Defaults to ga:visits metric, but that can be changed simply passing a
	// parameter to the metrics variable
	// e.g: On the client, if you want the pageviews metrics, then call as
	// Meteor.call('getAnalyticsData', 'ga:pageviews');

	getAnalyticsData: function(metrics = 'ga:users') {
		return analyticsData(metrics);
	},
});

// Functions

var analyticsData = Meteor.wrapAsync(function(metrics, callback) {
	authClient.authorize( Meteor.bindEnvironment(function(err, tokens) {
    if (err) callback(err, null);

    // Define the dates to iterate over
    // xCoordVal is a property for if you want to define the x axis values of the graph
    var dateRanges =
    [
      {
				'start-date': '15daysAgo',
    		'end-date': 'today',
    		'xCoordVal': 2,
      },
      {
      	'start-date': '30daysAgo',
    		'end-date': '15daysAgo',
    		'xCoordVal': 1,
      },
      {
      	'start-date': '45daysAgo',
    		'end-date': '30daysAgo',
    		'xCoordVal': 0,
      }
    ];

    var totals = [];
    var dates = [];
    var finalResult = {};

    _.each(dateRanges, function(date) {
    	var totalResult = analyticsGetDataRange(metrics, date);
    	totals.push(totalResult);
    	dates.push(date.xCoordVal);
    });
    console.log('AYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
    console.log(totals);
    console.log(dates);

    finalResult = {
    	'dates': dates, // x coordinate on chart
    	'totals': totals, // y coordinate on chart
    };

    callback(null, finalResult);
	}));
});

var analyticsGetDataRange = Meteor.wrapAsync(function(metrics, date, callback) {
	// how2get profile Id: https://gist.github.com/searls/83d5126be6a096294f35
	analytics.data.ga.get({
	  auth: authClient,
	  'ids': 'ga:127900436',
	  'start-date': date['start-date'],
	  'end-date': date['end-date'],
	  'metrics': metrics
	}, function(err, result) {
	    if (err) callback(err, null);
	    console.log(result);
	    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
	    console.log(date['start-date']);
	    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
	    callback(null, result.totalsForAllResults[metrics]);
	});
});

var analyticsDataV4 = Meteor.wrapAsync(function(metrics, callback) {
			authClient.authorize(function(err, tokens) {
			if (err) callback(err, null);
			analyticsreporting.reports.batchGet({
	     "headers": {
	          "Content-Type": "application/json"
	      },
	      "auth": authClient,
	      "resource": {
          "reportRequests":[
    				{
    				  "viewId":"127900436",
    				  "dateRanges":[
    			    {
    			      "startDate":"15daysAgo",
    			      "endDate":"today"
    			    },
    			    {
    			      "startDate":"30daysAgo",
    			      "endDate":"15daysAgo"
    			    }],
    				  "metrics":[
    			    {
    			      "expression":metrics
    			    }],
    				}]
	      },
			}, function(err, result) {
				if (err) callback(err, null);
				callback(null, result);
			});
		});
});