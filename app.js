var app = app || {};

/*
### to-change log
	+ now + loc to app.user
*/


//--events
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

//---user info 
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
		name = 'here',
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
		console.log('time: ', time());
		console.log('date: ', date());
		console.log('fp: ', fp());
	};
	
	return {
		init : init,
		nabe : nabe,
		boro : boro,
		name : name
	}
	
})();

//--mongodb controls
app.database = (function(){

	var response =  '',
		baseurl = 'http://peaceful-spire-5824.herokuapp.com/';

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
				//callback(data);
				console.log('done');
				console.log(data);
		});

	};
	
	//find in user collection
	var user = function(query, callback, errorcallback){
	
		if(typeof(query) == "object"){
			query = JSON.stringify(query);
		};
			
		console.log('user + ', query);

		/*		
		$.ajax({
			type: "GET",
			dataType: 'json',
			url: baseurl + 'user/' + query,
		}).success(function(data) {
				response = data;
				//callback(data);
				console.log('done');
				console.log(data);
		});
		*/
		
	};
	
	//track in user collection.
	var track = function(query, callback, errorcallback){

		$.ajax({
			url: baseurl + 'track/' + query,
		}).success(function(data) {
				response = data;
				//callback(data);
				console.log('done');
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

			case 'find':
				find(query, callback, errorcallback);
			break;
			
			case 'track':
				track(query, callback, errorcallback);
			break;		
		};	
		
	};
	
	return {
		
		init : init
	};

	/* {"user": {"finger": "asdflkasfd", "geoLat": 40.7229, "geoLon": -73.8424, "geoNabe": "Greenpoint", "geoBoro": "Brooklyn", "geoName": "Home"}, "dropDown": {"term": "New York"}} */

})();

//--nav controls
app.nav = (function(){
		
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

		if(loc !== 'nabe'){
			if(place !== 'here'){
				callLog();
			}
		}else{
			setTimeout(readyCheck, 1000);	
		};	
		
		app.events.publish('nav:ready', 'Navigation is fully loaded.');
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
						call = '"user.geoName" : "'+ app.user.name+ '"';
					}else{
						call = '';
					};
				break;
			
				case 'nabe':
					if(category() == "All"){
						call =  '"user.geoNabe" : "'+ app.user.nabe+ '" ';
					}else{
						call = '';
					};
				break;
				
				case 'boro':
					if(category() == "All"){
						call =  '"user.geoBoro" : "'+ app.user.boro+ '"';
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
	
	//time definition
	var time = function(){
		var x = $('select#timeType').find('option:selected').attr('id');
		var x = parseFloat(x);
		return x
	};
	var time_call = function(){
		var date_now = new Date;
		var date_past = date_now - 1000 * 60 * 60 * 24 * time();
		date_past = new Date(date_past).toISOString();
		date_now = date_now.toISOString();
		
		var call = '"date" : {$gte: ISODate("' + date_past + '"), $lt: ISODate("' + date_now + '")}';
		return call;
		
	};
	
	
	//--get articles
	var getArticleList = function(){

		var call = '';
		
		if(category() == 'All'){
			call = '{' + time_call() + ', ' + location_call() + '}';
			app.database.init('user', call);
		}else{
			call = '{ "time" : ' + time() + ', "cat" : "' + category() + '"}';
			app.database.init('find', call);
		};

	};
	
	//--listeners
	var listeners = function(){

		//--nav:general listeners	
		app.events.subscribe('location:ready', build);

		app.events.subscribe('nav: ready', function(){
			//--nav:newstype listeners
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
	
			//refresh feed
			app.events.subscribe('feed:refresh', getArticleList);
		});
	};
		
	//--init
	var init = function(){
		listeners();
	};
	
	return {
		
		init : init
		
	}
	
	
	
	
})();

//--newsfeed manager
app.newsfeed = (function(){
	
	
	
	
	var init = function(){
		
		
	};
	
	return {
		
		init : init
		
	}
	
})();




// app.events.subscribe('status:update', updateStatus);
// app.events.publish('status:update', [notes.length, _.where(notes,{liked : true}).length]);



app.init = (function(){
	app.user.init();
	app.nav.init();
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
