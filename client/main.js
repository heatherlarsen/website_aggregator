// routing
Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('navbar', {
    to: "navbar"
  });
  this.render('search_form', {
  	to: "search"
  });
  this.render('website_list', {
  	to: "main"
  });
  this.render('website_form', {
  	to: "secondary"
  });
  this.render('footer', {
  	to: "footer"
  });
});

Router.route('/website/:_id', function() {
	this.render('navbar', {
		to: "navbar"
	});
	this.render('search_form', {
	  	to: "search"
	  });
	this.render('website', {
		to: "main",
		data: function() {
			return Websites.findOne({_id:this.params._id});
		}
	});
	this.render('website_form', {
	  	to: "secondary"
	});
	this.render('comment_list', {
		to: "comments"
	});
	this.render('comment_form', {
		to: "commentForm"
	});
	this.render('footer', {
	  	to: "footer"
	  });
});

/*
Router.route('/userSites', function() {
	this.render('navbar', {
		to: "navbar"
	});
	this.render('website_list', {
		to: "main", 
		data: function() {
			if (Meteor.user()) {
				var user = Meteor.user()._id;
				console.log(user);
				return Websites.filter({createdBy: user});
			}
		}
	});
	this.render('website_form', {
		to: "secondary"
	});
	this.render('footer', {
		to: "footer"
	});
});
*/

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

Template.website_item.helpers({
	getUser: function(user_id) {
		var user = Meteor.users.findOne({_id:user_id});
		if (user) {
			return user.username;
		} else {
			return "Anonymous";
		}
	}, 
	getRating: function(rating) {
		if (rating) {
			return rating;
		} else {
			return 0;
		}
	}
});

Template.search_form.helpers({
  	websiteIndex: () => WebsitesIndex
});

Template.comment_list.helpers({
	comments:function() {
		return Comments.find({websiteId: Router.current().params['_id']}, {sort:{createdOn:-1}});
	}
});

Template.comment_item.helpers({
	getUser: function(user_id) {
		var user = Meteor.users.findOne({_id:user_id});
		if (user) {
			return user.username;
		} else {
			return "Anonymous";
		}
	}, 
	getReadableDate: function(full_date) {
		var dateObject = full_date;
		var monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var dateMonth = dateObject.getMonth();
		dateMonth = monthsArr[dateMonth];
		var dateDay = dateObject.getDate();
		var dateYear = dateObject.getFullYear();
		var dateReadable = dateMonth + " " + dateDay + ", " + dateYear;
		var timeHours = dateObject.getHours();
		var timeMinutes = dateObject.getMinutes();
		var ampm = timeHours >= 12 ? 'pm' : 'am';
		timeHours = timeHours % 12;
		timeHours = timeHours ? timeHours : 12;	// the hour '0' should be '12'
		timeMinutes = timeMinutes < 10 ? '0'+timeMinutes : timeMinutes;
		var timeReadable = timeHours + ':' + timeMinutes + ampm;

		return dateReadable + " @ " + timeReadable;
	}
});


/////
// template events 
/////

Template.navbar.events({
	'click .js-show-website-form': function(event) {
        $("#website_add_form").modal('show');
    }, 
    'click .js-show-search-form': function(event) {
    	$("#search_container").modal('show');
    }
});

Template.search_form.events({
	"click .js-modal-close": function(event) {
		$("#search_container").modal("hide");
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
    "blur .js-url": function(event) {
    	if ($('#url').val() !== "") {
    		$('.site-address').css('margin-bottom', '0px');
    		$('.js-autofill').css('display', 'inline-block');
    	}
    },
    "click .js-autofill": function(event) {
    	var url = $('#url').val();
    	extractMeta(url, function (err, res) { 
    		if (typeof res !== "undefined") {
    			if ((typeof res.title !== "undefined" || res.title !== "") && $('#title').val() == "") {
    				$('#title').val(res.title);
    			}
    			if ((typeof res.description !== "undefined" || res.description !== "") && $('#description').val() == "") {
    				$('#description').val(res.description);
    			}
    		} else {
    			console.log(err);
    		}
    	});

    	return false;
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

Template.website.events({
	"click .js-upvote":function(event){
		var website_id = this._id;
		console.log(website_id);

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

Template.comment_form.events({
	'click .js-show-comment-form': function(event) {
		$('#comment_add_form').modal('show');
	}, 
	'click .js-cancel-form': function(event) {
		$('#comment_add_form').modal('hide');
	}, 
	'submit .js-save-comment-form': function(event) {
		if (Meteor.user()) {
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