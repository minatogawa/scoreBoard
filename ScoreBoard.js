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

}