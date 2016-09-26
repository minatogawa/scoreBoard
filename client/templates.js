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

		// Call method 'getAnalyticsData' from server and logs in browser console
		// beware: passing the argument newIndicator, which should be a valid one,
		// 'ga:views' for example
		Meteor.call('getAnalyticsData', newIndicator, function(error, result) {
			if (error) console.log(error);
			console.log('Toda a resposta fornecida:');
			console.log(result);
			console.log('Propriedade totalsForAllResults:')
			// console.log(result.totalsForAllResults);
			// console.log(result.profileInfo.profileId);
			// console.log(result.rows);
		});
	},
	
	'click .choiceId':function(){
		Session.set("currentChoiceId", this._id);
	}
});

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
});

Template.featuredChoice.helpers({
	'clickedChoice':function(){
		var currentChoiceId = Session.get("currentChoiceId");
		return Choices.findOne({_id:currentChoiceId});
	},

	
});

Template.featuredChoice.events({
	'click .deleteChoice':function(){
		var currentChoiceId = Session.get("currentChoiceId")
		Choices.remove({_id:currentChoiceId});
	},

	'click .updateChoiceData':function(){
		var currentChoiceId = Session.get("currentChoiceId");
		var fieldName = Choices.findOne({_id:currentChoiceId}, {fields: {indicator:1, _id:0}}).indicator;
		console.log("@@@@@@@@@@@");
		console.log(fieldName);
		
		Meteor.call('getAnalyticsData', fieldName, function(error, result) {
			if (error){
				console.log(error);	
				} else{
					Choices.update({_id:currentChoiceId}, {$set:{current:result.totalsForAllResults[fieldName]}					});
				
			}				
		});
	}
})

