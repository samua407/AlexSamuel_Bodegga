var app = app || {};

/*
### to-change log
	+ now + loc to app.user
*/

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
						boro = result.results[i].address_components[0].long_name;
					}
				}

			    nabe = hood[0];
			    //console.log('nabe: ', nabe);
				//console.log('boro: ', boro);
		
				//call foursquare for loc check in
				exploreNabe();	
		    }
		});

	};
	
	var exploreNabe = function(){
		
		var pos = lat + "," + lng;
		var url = 'https://api.foursquare.com/v2/venues/search?ll='+ pos+'&client_id=***&client_secret=***&v=20131016';
		

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
		init : init
	}
	
})();


app.database = (function(){

	var response =  '',
		baseurl = 'http://peaceful-spire-5824.herokuapp.com/';

	//find in db.
	var find = function(sql, callback, errorcallback){

		if(!callback){callback = function(){}};
		if(!errorcallback){errorcallback = function(){}};

		$.ajax({
			type: "GET",
			dataType: 'json',
			url: baseurl + 'find/' + sql,
		}).success(function(data) {
				response = data;
				//callback(data);
				console.log('done');
				console.log(data);
		});

	};
	
	//track in db.
	var track = function(sql, callback, errorcallback){
		
		if(!callback){callback = function(){}};
		if(!errorcallback){errorcallback = function(){}};

		$.ajax({
			url: baseurl + 'track/' + sql,
		}).success(function(data) {
				response = data;
				//callback(data);
				console.log('done');
				console.log(data);
		});
		
	};
	
	var init = function(call, sql, callback, errorcallback){
	
		switch(call){
			case 'find':
				find(sql, callback, errorcallback);
			break;
			
			case 'track':
				track(sql, callback, errorcallback);
			break;		
		};	
		
	};
	
	return {
		
		init : init
	};

	/* {"user": {"finger": "asdflkasfd", "geoLat": 40.7229, "geoLon": -73.8424, "geoNabe": "Greenpoint", "geoBoro": "Brooklyn", "geoName": "Home"}, "dropDown": {"term": "New York"}} */

})();


