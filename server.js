Kinvey = require("kinvey");
http = require('http');
async = require("async");

Kinvey.init({
    appKey: 'kid_PVFkQeQG5M',
    masterSecret: '183b25b078a24074a8a8942174e45df7'
});

var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

// ************************************************************************************************************************
// GET STUFF FROM LOCU
// ************************************************************************************************************************

// Get restaurants by name from Locu
exports.getRestaurantsByNameFromLocu = function(name,where,callback){
	name = escape(name);
	where = escape(where);
	builtURL = "http://api.locu.com/v1_0/venue/search/?api_key=418fc7dbac319d60f50e0cc0b3442eb848d47e82&name="+name+"&locality="+where+"";

	http.get(builtURL,function(res){
		buffer = "";
		res.on('data', function(chunk){
	    	buffer += chunk;
		});
		
		res.on('end', function(){
			callback(null,buffer);
		});
	});
}

// Get menu from a restaurant using an id from Locu
exports.getRestaurantByIdFromLocu = function(restaurant_locu_id, callback){
	builtURL = "http://api.locu.com/v1_0/venue/"+restaurant_locu_id+"/?api_key=418fc7dbac319d60f50e0cc0b3442eb848d47e82";

	http.get(builtURL,function(res){
		buffer = "";
		res.on('data', function(chunk){
	    	buffer += chunk;
		});
		
		res.on('end', function(){
			callback(null,buffer);
		});
	});
}

// Get nearby restaurants with current discount from us
exports.getNearbyRestaurants = function(limit,radius,lat,lon,name,callback){
	
	builtURL = "http://api.locu.com/v1_0/venue/search/?location="+lat+"%2C"+lon+"&radius="+radius+"&api_key=418fc7dbac319d60f50e0cc0b3442eb848d47e82";
	if(name != ''){
		builtURL += "&name="+name;
	}
	
	http.get(builtURL,function(res){
		buffer = "";
		res.on('data', function(chunk){
	    	buffer += chunk;
		});
		
		res.on('end', function(){
			jsonRes = JSON.parse(buffer);
			var output = [];
			async.forEachSeries(jsonRes.objects,function(restaurant,callback){
				exports.getRestaurantByLocuId(restaurant.id,function(err,ourRestaurant){
					if(limit == null || output.length < limit){
						if(ourRestaurant == null){
							restaurant.discount = 0;
							output.push(restaurant);
						} else {
							output.push(ourRestaurant);
						}
					}
					callback();
				});
			}, function(){
				callback(null,output);
			});
		});
	});
}

// ************************************************************************************************************************
// IMPORTING
// ************************************************************************************************************************

// Imports a business from Locu, including the menu items using the locuID
exports.importRestaurantFromLocu = function(restaurant_id){
	exports.getRestaurantByLocuId(restaurant_id,function(err,data){
		if(data.length > 0){
			console.log("Restaurant is already in the DB");
		} else {
			exports.getRestaurantByIdFromLocu(restaurant_id, function(err, json){
				var jsonResponse = JSON.parse(json);
				if(jsonResponse.objects.length > 0){
					var businessJson = jsonResponse.objects[0];

					var menu = {};
					if(businessJson.has_menu && businessJson.menus.length > 0){
						menu = businessJson.menus[0];
						console.log("clearing menus");
						businessJson.menus = [];
					}
			
					var rest = new Kinvey.Entity(jsonResponse.objects[0], 'Business');

					// Default value of k to 1
					rest.k = 1;
					rest.save({
						success: function(rest) {
							console.log("Business Imported");
							if(menu.sections.length > 0){
								console.log("Importing Menu");
								importMenuForBusiness(rest,menu);
							}
    					},
					    error: function(error) {
							console.log("Failed! " + JSON.stringify(error));
				    	}
					});
				}
			});		
		}
	});
}

// Import all the menu items from Locu into our database
importMenuForBusiness = function(restaurant,menu){
	// Process Sections in Menu
	menu.sections.forEach(function(menuSection){
		// Process Subsections
		menuSection.subsections.forEach(function(subsection){
			// Process content
			subsection.contents.forEach(function(menu_item){
    			if(menu_item.type == 'ITEM'){
					// Need to check if this item exists first
					var query = new Kinvey.Query();
					query.on('locu_id').equal(menu_item.id);
					var collection = new Kinvey.Collection('Item', { query: query });
					collection.fetch({
    					success: function(list) {
							if(list.length == 0){
								var ourItem = new Kinvey.Entity({
									business_id: restaurant._id,
									item_name: menu_item.name,
									description: menu_item.description.replace("’","'"),
									locu_id: menu_item.id,
									price: menu_item.price
								}, 'Item');
						
								ourItem.save({
								    success: function(item) {
										console.log("Created entity " + ourItem.get("item_name"));
								    },
								    error: function(error) {
										console.log("Failed on:" + ourItem.get("item_name") + " " + JSON.stringify(error));
									}
								});
							} else {
								console.log(list[0].item_name + " is already there");
							}
					    },
					    error: function(error) {
    					}
    				});
				}
			});
		});
	});
}

// ************************************************************************************************************************
// GET DATA FROM OUR DATABASE
// ************************************************************************************************************************

// Get the favorites of the user
exports.getFavorites = function(id,skip,limit,callback){
	var query = new Kinvey.Query();
	query.on('user_id').equal(id);
	query.setLimit(limit);
	query.setSkip(skip);
	var favoritesCollection = new Kinvey.Collection('Favorite', { query: query });

	favoritesCollection.fetch({
		success: function(favorites){
			var output = [];
			async.forEach(favorites, function(favorite,callback){
				exports.getRestaurant(favorite.attr.business_id,function(err,restaurant){
					output.push(restaurant);
					callback();
				});
			}, function(){
				callback(null,output);
			});
		},
		error: function(error){
			console.log(error);
		}
	});
}

exports.getNearbyRestaurantsMap = function(limit,radius,lat,lon,name,callback){
	exports.getNearbyRestaurants(limit,radius,lat,lon,name,function(err,restaurants){
		var outURL = "https://maps.googleapis.com/maps/api/staticmap?size=288x200&sensor=false&markers=";
		for(var r=0;r<restaurants.length;r++){
			if(restaurants[r].street_address != null){
				var marker = restaurants[r].street_address + ',' + restaurants[r].locality + ',' + restaurants[r].region + ' ' + restaurants[r].postal_code;
				outURL += marker + "|";
			}
		}
		
		console.log(outURL);
	});
}

// Get a particular restaurant by locu id
exports.getRestaurantByLocuId = function(id,callback){
	var query = new Kinvey.Query();
	query.on('id').equal(id);
	var restCollection = new Kinvey.Collection('Business', { query: query });
	
	restCollection.fetch({
		success: function(rests){
			// This should only return one
			if(rests.length > 0){
				business = rests[0];
				exports.getCurrentDiscount(business.attr._id,function(err,discount){
					business.attr.discount = discount;
					callback(null,business);
				});
			} else {
				callback(null,null);
			}
		},
		error: function(error){
			console.log(SON);
		}
	});
}

// Get a particular restaurant by id
exports.getRestaurant = function(business_id,callback){
	// Get the business
	var entity = new Kinvey.Entity({}, 'Business');
	entity.load(business_id, {
    	success: function(business) {
			exports.getCurrentDiscount(business.attr._id,function(err,discount){
				business.attr.discount = discount;
				callback(null,business);
			});
	    },
    	error: function(error) {
        	console.log(error);
        	callback(null,null);
	    }
	});
}

// For each interval, get the restaurant with the maximum discount
exports.getMaxDiscountRestaurantPerInterval = function(radius,lat,lon,dow,callback){
	
	var output = [];
	var intervals = [];
	for(var h=0;h<=23;h++){
		for(var m=0;m<=3;m++){
			var pad = "00";
			h = h + "";
			mm = m*15 + "";
			hh = pad.substring(0, pad.length - h.length) + h;
			mm = pad.substring(0, pad.length - mm.length) + mm;
			intervals.push(interval = hh + ":" + mm);
		}
	}
	
	async.forEachSeries(intervals,function(interval,callback){
		console.log("Processing interval: " + interval);
		getMaxRestaurantForInterval(interval,radius,lat,lon,dow,function(err,maxRest){
			output.push({"interval": interval, "restaurant": maxRest});
			callback();
		});
	}, function(){
		callback(null,output);
	});
}

//	(limit,radius,lat,lon,name,callback)
getMaxRestaurantForInterval = function(interval,radius,lat,lon,dow,callback){
	exports.getNearbyRestaurants(1,radius,lat,lon,"",function(err,restaurants){
		//console.log("Restaurants: " + restaurants.length);
		var output = restaurants[0];		
		async.forEachSeries(restaurants, function(restaurant,callback){			
			//console.log("Processing restaurant: " + restaurant.name);
			exports.getRestaurantByLocuId(restaurant.id,function(err,ourRestaurant){
				if(ourRestaurant != null){
					if(output == null){
						output = ourRestaurant;
					} else if(output.discount < ourRestaurant.discount){
						output = ourRestaurant;
					}
				}
				callback();
			});
		}, function(){
			callback(null,output);
		});
	});
}

// ************************************************************************************************************************
// DISCOUNTS CALCULATION
// ************************************************************************************************************************

// Get the current discount based on day of the week and interval
exports.getCurrentDiscount = function(business_id,callback){
	var d = new Date();
	var h = d.getHours()+"";

	var m = d.getMinutes();
	m = Math.floor(m/15)*15 + "";
	var pad = "00";
	h = pad.substring(0, pad.length - h.length) + h;
	m = pad.substring(0, pad.length - m.length) + m;

	var interval = h + ":" + m 
	
	exports.getCurrentDiscounts(business_id,function(err,discounts){
		filtered = discounts.filter(function (el) {
  			return el.label == interval;
		});
		
		if(filtered.length > 0){
			callback(null, filtered[0].discount);
		} else {
			callback(null, 0);
		}
	});
}

exports.getCurrentDiscounts = function(business_id,callback){
	var d = new Date();
	var n = d.getDay();
	exports.getDiscounts(business_id,weekday[n],callback);
}

// Get the discounts of a business on a particular day
exports.getDiscounts = function(business_id,dow,callback){
	// Get the business
	var entity = new Kinvey.Entity({}, 'Business');
	entity.load(business_id, {
    	success: function(business) {
			getBusinessDiscounts(business,dow, function(err, discounts){
        		callback(null, discounts);
        	});
	    },
    	error: function(error) {
        	console.log(error);
        	callback(null, []);
	    }
	});
}

// Return business discounts
getBusinessDiscounts = function(business,dow,callback){

	// To return
	var discounts = new Array();

	// Get the schedules for this business
	var scheduleQuery = new Kinvey.Query();
	scheduleQuery.on('business_id').equal(business.id);
	var dowQuery = new Kinvey.Query();
	dowQuery.on('day_of_week').equal(dow);

	var schedulesCollection = new Kinvey.Collection('Schedule', { query: scheduleQuery.and(dowQuery) });

	schedulesCollection.fetch({
		success: function(schedules){
			
			// Get the items of this business
			var itemQuery = new Kinvey.Query();
			itemQuery.on('business_id').equal(business.id);
			var itemsCollection = new Kinvey.Collection('Item', { query: itemQuery });
		
			itemsCollection.fetch({
		    	success: function(items) {
					// Iterate over intervals
					for(var ivl=0;ivl < schedules.length; ivl++){
						var interval = schedules[ivl];
						var discount = getIntervalDiscount(items,interval,business);
						discounts.push({"label": interval.attr.time, "discount": discount});
					}	
					callback(null, discounts);
			    },
    			error: function(error) {
			    }
			});
		},
		
		error: function(error){
		}
	});
	
	return discounts;
}

// TODO: Moving average of previous order data
getPredictedOrders = function(interval,item){
	// Predicted order is going to come from a different model based on the interval and the item
	return 20;
}

// Get the discount of a particular item in an interval
getIntervalItemDiscount = function(interval,item,k){

	var predicted_orders = getPredictedOrders(interval,item);

	// Time per item is the max time it takes for one employee to make one item
	// multiplied by the scaling factor to the power of number of employees in this interval.
	var t_empl = item.attr.tmax*Math.pow((1-item.attr.s),interval.attr.n-1);
	
	// Utilization based on employees
	var upe = predicted_orders*Math.max(item.attr.tmin,t_empl)/(15*interval.attr.n);
	
	// Utilization based on infrastructure
	var upi = predicted_orders/item.attr.max_capacity;
	
	var up = Math.max(upe,upi);
	
	// DEBUG
	//console.log(" Interval: " + interval.attr.time + " Item: " + item.attr.item_name + " - predicted_orders: " + predicted_orders + " - up: " + up + " - upi: " + upi + " upe: " + upe + " disc: " + (interval.attr.u - up));
	
	// U is the threshold at which we start offering discounts
	return (interval.attr.u - up)*k*interval.attr.p;
}

// Get the discount of a particular interval of a particular business
getIntervalDiscount = function(items,interval,business){
	// Iterate over items in this interval
	var interval_discount = 0;

	for(var itm=0;itm < items.length;itm++){
		var item = items[itm];
		var new_interval_discount = getIntervalItemDiscount(interval,item,business.attr.k);
							
		if(new_interval_discount < 0){
			new_interval_discount = 0;
		}
		interval_discount = Math.max(interval_discount,new_interval_discount);
	}
	
	return interval_discount;
}

// ************************************************************************************************************************
// TEST CLIENT
// ************************************************************************************************************************

42.38
-71.03
1600


//exports.getFavorites("50a8edb407e58a812800337f",0,3,function(err,response){
//exports.getNearbyRestaurants(3,1600,42.38,-71.03,"",function(err,response){
//	console.log(response);
//});
exports.getNearbyRestaurantsMap(10,1600,"42.3447677","-71.1009621","",function(err,maxRest){
	console.log("RESULT " + maxRest);
});
//exports.getMaxRestaurantForInterval(
//exports.getMaxDiscountRestaurantPerInterval(null,null);