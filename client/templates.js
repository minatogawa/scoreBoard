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