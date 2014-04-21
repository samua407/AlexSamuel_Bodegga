var app = app || {};

//--events manager
app.events = (function() {

	var publish = function (name, o) {
       
        console.log("EVENT [" + name + "]", o);
        $(document).trigger(name, [o]);
    
    };

    var subscribe = function (name, callback) {
        
        $(document).on(name, function(event, o){            
            callback(o);
        });

    };

    return {
    	publish : publish,
    	subscribe : subscribe
    }; 

})();

//---user manager 
app.user = (function(){

	//get time
	var time = function(){
		var d = new Date();
		var hh = d.getHours();
		var mm = d.getMinutes();
		if(mm < 10){mm = '0' + mm;}
		var ss = d.getSeconds();
		if(ss < 10){ss = '0' + ss;}
		var full = hh + ":" + mm + ":" + ss;
		return full;
	};
	
	//get date
	var date = function(){
		var d = new Date();
		var yy = d.getFullYear();
		var mm = d.getMonth()+1;
		if(mm < 10){mm = '0' + mm;}
		var dd = d.getDate();
		if(dd < 10){dd = '0' + dd;}
		var full = yy + "-" + mm + "-" + dd;
		return full;
	};
	
	//get fingerprint for user
	var fp = function(){
		var fingerprint = new Fingerprint({canvas: true}).get();
		return fingerprint;
	};
	
	//define location variables
	var nabe = '',
		boro = '',
		lat = '',
		lng = '',
		//name = 'here',
		name = 'home',
		type = '';
	
	//pull nabe + boro from google api
	var getNabe = function(p){
		
		//get user's lat/lng
	    lat = p.coords.latitude;
	    lng = p.coords.longitude;
	  	
	  	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+ lat +','+ lng +'&sensor=true';	
		//gp	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=40.7310412,-73.9585554&sensor=true';
		//d12	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=40.737047,-73.992206&sensor=true'; 
		//ues	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=40.770556,-73.956730&sensor=true'; 
		
		//gmaps api call to get nabe + boro
	  	jQuery.ajax({
		    url: url,
		    success: function(result) {		
		    				
				var num = result.results.length - 1;				

				var hood = [];
				var i;
				for(i = num; i > -1; i--){
					if(result.results[i].types[0] == 'neighborhood'){
						hood.unshift(result.results[i].address_components[0].long_name);						
					}
					if(result.results[i].types[0] == 'sublocality'){
						app.user.boro = result.results[i].address_components[0].long_name;
					}
				}

			    app.user.nabe = hood[0];
			    
			    var publishLoc = "You are in " + app.user.nabe + ", " + app.user.boro + ".";
				
				app.events.publish('location:ready', publishLoc);
		
				//call foursquare for loc check in
				exploreNabe();	
		    }
		});

	};
	
	//pull/sort/append venue list from foursquare
	var exploreNabe = function(){
		
		var pos = lat + "," + lng;
		var url = 'https://api.foursquare.com/v2/venues/search?ll='+ pos+'&client_id=***&client_secret=***&v=20131016'
		

		//preparing functions for venue list jquery resp
		var namePullCount = 0;
			optBuildCount = 0,
			venueTotal = 0,
			initialList = [],
			finalList = [];
		
		var sortVenues = function(){
			finalList.sort(function(a,b) {
			    return a.text.localeCompare(b.text);
			});
			buildVenueList();
			
		};
		
		var addVenueOptions = function(elem, index, array){
			name = elem.name.toString();
			var o = new Option(name, elem.type);	
			$(o).html(name);
			finalList.push(o);
			optBuildCount++;
			
			if(optBuildCount == venueTotal){
				sortVenues();
			};
			
		};

		var pullName = function(element, index, array){
			namePullCount++;
			var v = {"name": element.name, "type" : element.categories[0].name};
			initialList.push(v);
			
			if(namePullCount == venueTotal){
				initialList.forEach(addVenueOptions);
			};
		};
		
		var buildVenueList = function(){

			//add spacer
			o = new Option('', '#');	
			$(o).html('');
			finalList.push(o);
	
			//add "none" option
			o = new Option('None of these', '#');	
			$(o).html('None of these');
			finalList.push(o);
			
			//append array
			$(".location").append(finalList);
			$(".location").css('opacity', '1');
			$("#nabeload").fadeTo("fast", 0);
			var location = $('select.location');
			location.change(function(data){
				
				var selected = $(this).find('option:selected');
				name = selected[0].text.replace("'", "");
				type = selected[0].value;
			
				//post();
				//nav.init();
				
			});
	
		};
		
		//call foursquare to get list of locations
		$.getJSON( url, function( data ) {
			var venues = data.response.venues;
			var num = venues.length-1;

			var test = [];
			
			venueTotal = venues.length;
			venues.forEach(pullName);
										
		});

	
	};
	
	var init = function(){
		navigator.geolocation.getCurrentPosition(getNabe);
		//console.log('time: ', time());
		//console.log('date: ', date());
		//console.log('fp: ', fp());
	};
	
	return {
		init : init,
		nabe : nabe,
		boro : boro,
		name : name
	}
	
})();

//--mongodb manager
app.database = (function(){

	var response =  '',
		//baseurl = 'http://peaceful-spire-5824.herokuapp.com/';
		baseurl = 'http://localhost:5000/';

	//find in article collection
	var find = function(query, callback, errorcallback){
	
		if(typeof(query) == "object"){
			query = JSON.stringify(query);
		};

	
		$.ajax({
			type: "GET",
			dataType: 'json',
			url: baseurl + 'find/' + query,
		}).success(function(data) {
				response = data;
				callback(data);
				//console.log(data);
		});


	};
	
	//find in user collection
	var user = function(query, callback, errorcallback){
	
		if(typeof(query) == "object"){
			query = JSON.stringify(query);
		};
						
		$.ajax({
			type: "GET",
			dataType: 'json',
			//url: baseurl + 'user/' + query,
			url: baseurl + 'user/{"date_start" : "2014-04-10T17:26:36.174Z", "today" : "2014-04-21T17:26:36.175Z", "geoNabe" : "Union Square"}',
		}).success(function(data) {
				callback(data);
				//console.log('done');
				//console.log(data);
		});
			
	};
	
	//find content in article colletion for list of urls
	var list = function(query, callback, errorcallback){

		if(typeof(query) == "object"){
			query = JSON.stringify(query);
		};

	
		$.ajax({
			type: "GET",
			dataType: 'json',
			url: baseurl + 'list/' + query,
		}).success(function(data) {
				response = data;
				callback(data);
				//console.log(data);
		});


		
	};
	
	//track in user collection.	
	var track = function(query, callback, errorcallback){

		$.ajax({
			url: baseurl + 'track/' + query,
		}).success(function(data) {
				response = data;
				//callback(data);
				//console.log('done');
				console.log(data);
		});
		
	};
	
	var init = function(call, query, callback, errorcallback){

		if(!callback){callback = function(){}};
		if(!errorcallback){errorcallback = function(){}};
		
		
		switch(call){
			case 'user':
				user(query, callback, errorcallback);
			break;
			
			case 'list':
				list(query, callback, errorcallback);
			break;
			
			case 'find':
				find(query, callback, errorcallback);
			break;
			
			case 'track':
				track(query, callback, errorcallback);
			break;		
		};	
		
	};
	
	return {		
		init : init,
	};


})();

//--nav manager
app.nav = (function(){
	
	var feed = [];
	
	//--nav display
	//build nav bar with user's location
	var build = function(){
		$('option#here').text(app.user.name);
		$('option#nabe').text(app.user.nabe);
		$('option#boro').text(app.user.boro);
		readyCheck();	
	};	
		
	//check to see if nav bar was built
	var readyCheck = function(){
		var loc = $('select#locationType').find('option:selected').val();
		var place = $('select#locationType').find('#here').val();

		//check to see that user's data loaded into drop downs
		if(loc != 'nabe'){
			if(place != 'here'){
				//callLog();						
				app.events.publish('nav:ready', 'Navigation is fully loaded.');
				app.events.publish('feed:refresh', 'Ready to load articles.');
			}
		}else{
			setTimeout(readyCheck, 1000);	
		};	
	};
		
	//category name
	var category = function(){
		return $('select#newsType').find('option:selected').attr('id');	
	};
	
	//location definition
	var location = function(){
		return $('select#locationType').find('option:selected').attr('id');	
	};
	var location_call = function(){
		
		var call = '';
		
			switch( location() ) {
			
				case 'here':
					if(category() == "All"){
						call = '"geoName" : "'+ app.user.name+ '"';
					}else{
						call = '';
					};
				break;
			
				case 'nabe':
					if(category() == "All"){
						call =  '"geoNabe" : "'+ app.user.nabe+ '" ';
					}else{
						call = '';
					};
				break;
				
				case 'boro':
					if(category() == "All"){
						call =  '"geoBoro" : "'+ app.user.boro+ '"';
					}else{
						call = ''
					};
				break;
				
				case 'city':
					call = '';
				break;
			};
		

		return call;
		
		
	};
	
	//time definitions
	var time = function(){
		var x = $('select#timeType').find('option:selected').attr('id');
		var x = parseFloat(x);
		return x
	};
	var time_today = function(){
		var now = new Date;
		now = now.toISOString();
		return now;
	};
	var time_start = function(){
		var date_now = new Date;
		var date_past = date_now - 1000 * 60 * 60 * 24 * time();
		date_past = new Date(date_past).toISOString();
		
		return date_past;
		
	};
	var time_call = function(){
				
		//var call = '{$gte: ISODate(\'' + time_start() + '\'), $lt: ISODate(\'' + time_today() + '\')}';
		var call = '"date_start" : "' + time_start() + '", "today" : "' + time_today() + '"';
		return call;
		
	};
	
	
	//--get article list from either user db or article db
	var getArticleList = function(){

		var call = '';
		
		if(category() == 'All'){
			call = '{' + time_call() + ', ' + location_call() + '}';
			var callback = function(data){	getArticleURLs(data);	};
			app.database.init('user', call, callback);
		}else{
			call = '{' + time_call() + ', "cat" : "' + category() + '"}';
			var callback = function(data){
				app.nav.feed = JSON.parse(data);
				app.events.publish('nav:content:done', 'The ' + category() + ' Article array is ready.');
			};
			app.database.init('find', call, callback);
		};

	};
	
	//--get urls from user return
	var articleURLs = [];
	var getArticleURLs = function(data){
		data = JSON.parse(data);
		
		var num_results = data.length;
		var num_parsed = 0;
		
		data.forEach(function(el, arr, index){		
			var url = el.articleClick.url;		
			articleURLs.push(url);

			num_parsed ++ ;		
			if(num_parsed == num_results){
				app.events.publish('nav:urls:ready', 'All article URLS pulled from user return.');
			};

		});		

	};
	

	//--get story content from articleURLs
	var getArticleContent = function(){
				
		var urlList = [];
		var num_results = articleURLs.length;
		var num_pushed = 0;
		var callback = function(data){
			app.nav.feed = JSON.parse(data);
			app.events.publish('nav:content:done', 'The Most Read Article array is ready.')
		};
		articleURLs.forEach(function(el, arr, index){
			
			el = el.replace(/\//g, '^');
			var url = {"storyURL" : el};	
			urlList.push(url);
			
			num_pushed ++ ;		
			if(num_pushed == num_results){
				urlList = JSON.stringify(urlList);
				app.database.init('list', urlList, callback);
			};

		});

		
	};
	
	//--listeners
	var listeners = function(){

		//--nav:general listeners	
		app.events.subscribe('location:ready', build);
		app.events.subscribe('nav: ready', function(){
			
			//-- set up nav:newstype listeners
			//if news type changes, call db
			$('select#newsType').change(function(){ 

				//if user selects 'most recent'
				if( category() == 'All'){
					app.events.publish('nav:most_read', 'nav is set to most read');
				}else{
					app.events.publish('nav:category', 'nav is set to a category');
				};
				
				app.events.publish('feed:refresh', 'The category was changed.');
	
			});
					
			app.events.subscribe('nav:most_read', function(){ 
				$('#locationType').css('display', 'inline');
				$('#inLabel').css('display', 'inline');
			});
			app.events.subscribe('nav:category', function(){ 
				$('#locationType').css('display', 'none');
				$('#inLabel').css('display', 'none');
			});
			
			//if location changes, call db
			$('select#locationType').change(function(){ 
				app.events.publish('feed:refresh', 'The lcoation was changed.');
			});
			
			//if timerange changes, call db
			$('select#timeType').change(function(){ 
				app.events.publish('feed:refresh', 'The time range was changed.');
			});
	
			
		});
		
		//--nav articleURL listeners
		app.events.subscribe('nav:urls:ready', getArticleContent);
		
		//refresh feed
		app.events.subscribe('feed:refresh', getArticleList);
			
		
	};
		
	//--init
	var init = function(){
		listeners();
	};
	
	return {
		
		init : init,
		feed : feed
		
	}
		
})();


//--newsfeed 
app.newsfeed = (function(){
	//subscribe: nav:content:done
	
	var build = function(){
		console.log('build objects');
		clear_feed();	
		render_feed();
	};
	
	var clear_feed = function(){
		$('#articleList').empty();
	};
	
	var render_feed = function(){

		var	template,
			feedSrc,
			renderFeed;
	
		template = $('.newsfeed-template').text();
		feedSrc = app.nav.feed.slice(1, 4); //CUT WHEN BACK END IS WORKING
		renderFeed = _.template(template);		
		$(renderFeed({articles : feedSrc })).appendTo('#articleList');	
		app.events.publish('feed:loaded', 'The newsfeed is done loading.');
		
	};
	
	var load_listener = function(){
		
		$('#articleList li').click(function(e){
			e.preventDefault();
			var url = e.currentTarget.children[0].href;
			clear_reader();
			render_article(url);
		});
	};
	
	var clear_reader = function(){
		
		$('.reader').empty();
	};
	
	var render_article = function(url){
		var template,
			feedSrc,
			renderFeed,
			thisArticle;
		
		template = $('.reader-template').text();
		feedSrc = app.nav.feed.slice(1, 4); //CUT WHEN BACK END IS WORKING
		renderFeed = _.template(template);	
		
		thisArticle = _.findWhere(feedSrc, {storyURL : url});
		thisArticle.body = thisArticle.body.split('*#');
		thisArticle.date = thisArticle.date.split('T')[0];
		console.log(thisArticle);
	
		
		$(renderFeed({thisArticle : thisArticle })).appendTo('.reader');
		
		
	};
	
	var listeners = function(){
		app.events.subscribe('nav:content:done', build);
		app.events.subscribe('feed:loaded', load_listener);
	};

	var init = function(){
		listeners();	
	};
	
	return {
		
		init : init
	}
		
	
})();

/*
	var render_article = function(){
		
		var template,
			articleSrc,
			renderFeed;
		
		template = $('.newsfeed-template').text();
		articleSrc = app.nav.feed.slice(1, 4); //CUT WHEN BACK END IS WORKING
		renderFeed = _.template(template);	
		
		$(renderFeed({articles : feedSrc })).appendTo('#articleList');	
		
	};




*/








// app.events.subscribe('status:update', updateStatus);
// app.events.publish('status:update', [notes.length, _.where(notes,{liked : true}).length]);



app.init = (function(){
	app.user.init();
	app.nav.init();
	app.newsfeed.init();
})();




//		ArticleSchema = mongoose.Schema({
//		    hed: String,
//		    storyURL: { type: String, unique: true, index: true },
//		    date: Date,
//		    img: String,
//		    keywords: [],
//		    cat: String,
//		    body: String   
//		}),


//		UserSchema = mongoose.Schema({
//		    date: { type: Date, default: Date.now },
//		    user: { finger: String, geoLat: Number, geoLon: Number, geoNabe: String, geoBoro: String, geoName: String, geoType: String},
//		    search: { terms: String, resultKeys: [String] },
//		    dropDown: { term: String, resultKeys: [String] },
//		    articleClick: { name: String, url: String, keys: [String], tweet: Boolean, instapaper: Boolean, email: Boolean, copy: Boolean, ct: Boolean }  
//		}),
