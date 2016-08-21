Choices = new Mongo.Collection('choices');


if (Meteor.isClient){

	Template.table.events({
		'submit form':function(event){
			event.preventDefault();
			var newChoice = $('[name=newChoice]').val();
			var newIndicator = $('[indicator=newIndicator]').val();
			var newGoal = $('[goal=newGoal]').val();
			Choices.insert({
				name:newChoice,
				indicator:newIndicator,
				goal:newGoal,
			});
			$('[name=newChoice]').val('');
			$('[indicator=newIndicator]').val('');
			$('[goal=newGoal]').val('');

			// Call method 'getAnalyticsData' from server and logs in browser console
			Meteor.call('getAnalyticsData', function(error, result) {
				if (error) console.log(error);

				console.log(result);
			});
		},
		'click .choiceId':function(){
			Session.set("currentChoiceId", this._id);
		}
	})

	Template.table.helpers({
		'performanceRow':function(){
			return Choices.find({})
		},

		'selectedChoice':function(){
		var currentChoiceId = Session.get("currentChoiceId");
			if(this._id == currentChoiceId){
				return 'selected'
			}
		},

	})

	Template.featuredChoice.helpers({
		'clickedChoice':function(){
			var currentChoiceId = Session.get("currentChoiceId");
			return Choices.findOne({_id:currentChoiceId});
		}
	})

	Template.featuredChoice.events({
		'click .deleteChoice':function(){
		var currentChoiceId = Session.get("currentChoiceId")
			Choices.remove({_id:currentChoiceId});
		}
	})
}

if (Meteor.isServer){
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

	Meteor.methods({
		// Method to get ganalytics data of the profile id
		// Defaults to ga:visits metric, but that can be changed simply passing a
		// parameter to the metrics variable
		// e.g: On the client, if you want the pageviews metrics, then call as
		// Meteor.call('getAnalyticsData', 'ga:pageviews');
		//
		// how2get profile Id: https://gist.github.com/searls/83d5126be6a096294f35
		getAnalyticsData: function(metrics = 'ga:visits') {
			var f = new Future();
			authClient.authorize(function(err, tokens) {
		    if (err) f.throw(err);

		    analytics.data.ga.get({
		        auth: authClient,
		        'ids': 'ga:127900436',
		        'start-date': 'yesterday',
		        'end-date': 'today',
		        'metrics': 'ga:visits'
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
		getAnalyticsDataManual: function() {
			var profileId = 'ga:127900436';
			var data = {
				'ids': profileId,
				'start-date': 'yesterday',
				'end-date': 'today',
				'metrics': 'ga:pageviews'
			}

			try {
				var response = HTTP.get("https://www.googleapis.com/analytics/v3/data/ga",
					{ params: data }
				);

				return response;
			} catch(e) {
				console.log(e);
				throw new Meteor.Error(e.response);
			}
		}
	});
}