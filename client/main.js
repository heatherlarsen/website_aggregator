// routing
Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('navbar', {
    to: "navbar"
  });
  this.render('website_list', {
  	to: "main"
  });
  this.render('website_form', {
  	to: "secondary"
  });
});

Router.route('/website/:_id', function() {
	this.render('navbar', {
		to: "navbar"
	});
	this.render('website', {
		to: "main",
		data: function() {
			return Websites.findOne({_id:this.params._id});
		}
	});
	this.render('comment_list', {
		to: "comments"
	});
	this.render('comment_form', {
		to: "commentForm"
	});
});

// accounts config
Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
});

/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		return Websites.find({}, {sort:{rating:-1}});
	}
});


Template.comment_list.helpers({
	comments:function() {
		return Comments.find({websiteId: Router.current().params['_id']}, {sort:{createdOn:-1}});
	}
});


/////
// template events 
/////

Template.navbar.events({
	'click .js-show-website-form': function(event) {
        $("#website_add_form").modal('show');
    }
});

Template.website_item.events({
	"click .js-upvote":function(event){
		var website_id = this._id;

		if (Meteor.user()) {
			// get current rating for the website
			var currRating = Websites.findOne({_id:website_id}).rating;
			if (currRating === undefined || currRating === NaN) currRating = 0;
			var rating = currRating + 1;
			Websites.update({_id:website_id}, {$set: {rating: rating}});
		} else {
			$("#login_warning").modal('show');
		}

		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){
		var website_id = this._id;
		
		if (Meteor.user()) {
			// get current rating for the website
			var currRating = Websites.findOne({_id:website_id}).rating;
			if (currRating === undefined || currRating === NaN) currRating = 0;
			var rating = currRating - 1;
			Websites.update({_id:website_id}, {$set: {rating: rating}});
		} else {
			$("#login_warning").modal('show');
		}

		return false;// prevent the button from reloading the page
	}
});

Template.website_form.events({
    "click .js-cancel-form": function(event) {
    	$("#website_add_form").modal('hide');
    },
	"submit .js-save-website-form":function(event){
		var url = event.target.url.value;
		var title = event.target.title.value;
		var description = event.target.description.value;
        
        if (Meteor.user()) {
    		Websites.insert({
                url: url,
                title: title, 
                description: description,
                createdOn: new Date(), 
                createdBy: Meteor.user()._id
            });

            $("#website_add_form").modal('hide');
        } else {
        	$("#website_add_form").modal('hide');
        	$("#login_warning").modal('show');
        }

		return false; // stop the form submit from reloading the page

	}, 
	"click .js-close-warning": function(event) {
		$("#login_warning").modal('hide');
	}
});

Template.comment_form.events({
	'click .js-show-comment-form': function(event) {
		$('#comment_add_form').modal('show');
	}, 
	'click .js-cancel-form': function(event) {
		$('#comment_add_form').modal('hide');
	}, 
	'submit .js-save-comment-form': function(event) {
		if (Meteor.user()) {
			console.log(Meteor.user()._id);
			Comments.insert({
				websiteId: Router.current().params['_id'],
				comment: event.target.comment.value,
				createdOn: new Date(),
				createdBy: Meteor.user()._id
			});

			$('#comment_add_form').modal('hide');
		} else {
			$('#comment_add_form').modal('hide');
			$("#comment_login_warning").modal('show');
		}

		return false;
	}, 
	'click .js-close-comment-warning': function(event) {
		$("#comment_login_warning").modal('hide');
	}
});