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
						current:result.totals[0], // mudar isso para o desejado
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
			// 'totals' seria, por exemplo, o eixo y e 'dates' o eixo x (opcional)
			// pode ser modificado alterando xCoordVal na variável dateRanges
			// ('dates' pode ser uma string também, em vez de número)
			// ex: result.dates = ["30 dias atrás", "15 dias atrás"];
			// aí a chart no c3 ficaria, por exemplo
			// var chart = c3.generate({
			//     data: {
			//         x: 'x',
			//         columns: [
			//             ['x'].concat(result.dates), // opcional
			//             ['data1'].concat(result.totals)
			//         ]
			//     }
			// });

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

