Choices = new Mongo.Collection('choices');


if (Meteor.isClient){

	Template.table.events({
		'submit form':function(event){
			event.preventDefault();
			var newChoice = $('[name=newChoice]').val();
			var newIndicator = $('[indicator=newIndicator]').val();
			var newGoal = $('[goal=newGoal]').val();
			Meteor.call('getAnalyticsData', newIndicator, function(error, result) {
				if (error){
					console.log(error);	
					} else{
						Choices.insert({
							name:newChoice,
							indicator:newIndicator,
							goal:newGoal,
							current:result.totalsForAllResults[newIndicator],
						});
						$('[name=newChoice]').val('');
						$('[indicator=newIndicator]').val('');
						$('[goal=newGoal]').val('');
				}				
			});

		// 'submit form':function(event){
		// 	event.preventDefault();
		// 	var newChoice = $('[name=newChoice]').val();
		// 	var newIndicator = $('[indicator=newIndicator]').val();
		// 	var newGoal = $('[goal=newGoal]').val();
		// 	Meteor.call('getAnalyticsData', newIndicator, function(error, result) {
		// 		if (error){
		// 			console.log(error);	
		// 			} else{
		// 				Session.set('response', result);
		// 			  }
		// 	});

		// 	var currentMeasure = Session.get('response');
		// 	console.log("@@@@@@@@@@@@@@@@@@@@@@")
		// 	console.log(Session.get('response'))

		// 	Choices.insert({
		// 					name:newChoice,
		// 					indicator:newIndicator,
		// 					goal:newGoal,
		// 					current:currentMeasure,
		// 				});
		// 				$('[name=newChoice]').val('');
		// 				$('[indicator=newIndicator]').val('');
		// 				$('[goal=newGoal]').val('');
								
			


			//Deprecated: I tried to save the results in a session variable. However it only works on the first submit event.
			//All the other tries returns undefined for the results.
			// Session.set('response', result.totalsForAllResults["newIndicator"]);			
			// console.log("@@@@@@@@@@@@@@@@@@@@@@")
			// console.log(Session.get('response'))
			// var currentMeasure = Session.get('response');
			// var teste = String(currentMeasure);

			
			// Call method 'getAnalyticsData' from server and logs in browser console
			// beware: passing the argument newIndicator, which should be a valid one,
			// 'ga:views' for example
			Meteor.call('getAnalyticsData', newIndicator, function(error, result) {
				if (error) console.log(error);
				console.log('Toda a resposta fornecida:');
				console.log(result);
				console.log('Propriedade totalsForAllResults:')
				console.log(result.totalsForAllResults);
				console.log(result.profileInfo.profileId);
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

		// 'returnCurrent':function(){
		// var newIndicator = $('[indicator=newIndicator]').val();
		// Meteor.call('getAnalyticsData', newIndicator, function(error, result) {
		// 	if (error) console.log(error);
		// 	console.log('Oi');

		// 	});

		// }

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
	
	var self = this;

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
		getAnalyticsData: function(metrics = 'ga:visits') {
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


		        //the _.each approach haven't worked properly.
		        // _.each(result.data.items, function(item){
		        // 	var analytics = {
		        // 		total: item.totalsForAllResults,
		        // 		profileId: item.profileInfo.profileId,
		        // 	};
			       //  self.added('choices', Random.id(), analytics);

			       //  console.log("@@@@@@@@@@@@@@@@@@@");
			       //  console.log(analytics.total);
			       //  console.log("@@@@@@@@@@@@@@@@@@@");
		        // });

		        // self.ready();
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
}