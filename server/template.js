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
	//
	// how2get profile Id: https://gist.github.com/searls/83d5126be6a096294f35
	getAnalyticsData: function(metrics = 'ga:users') {
		var f = new Future();
		authClient.authorize(function(err, tokens) {
	    if (err) f.throw(err);

	    analytics.data.ga.get({
	        auth: authClient,
	        'ids': 'ga:127900436',
	        'start-date': '2016-08-01',
	        'end-date': 'today',
	        'metrics': metrics
	    }, function(err, result) {

	        if (err) f.throw(err);
	        console.log(result);


	        
	        return f.return(result);

	    });
		});
		return f.wait();
	},

	// Method not being used: Needs credentials authentication which can't be
	// done with a simple GET
	// getAnalyticsDataManual: function() {
	// 	var profileId = 'ga:127900436';
	// 	var data = {
	// 		'ids': profileId,
	// 		'start-date': 'yesterday',
	// 		'end-date': 'today',
	// 		'metrics': 'ga:pageviews'
	// 	}

	// 	try {
	// 		var response = HTTP.get("https://www.googleapis.com/analytics/v3/data/ga",
	// 			{ params: data }
	// 		);

	// 		return response;
	// 	} catch(e) {
	// 		console.log(e);
	// 		throw new Meteor.Error(e.response);
	// 	}
	// }
});