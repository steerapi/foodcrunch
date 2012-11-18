// Generated by CoffeeScript 1.4.0
var AccountsPayments, CancelSubscription, Confirm, Days, EatLater, EatNow, EatNowRestaurant, ForgotPass, FullMenuRestaurant, GraphRestLater, GraphTimeLater, Home, LunchDate, ManageSubscriptions, RestaurantSubscriptionActive, SearchRestLater, SelectTimeLater, Signup, Splash, Subscribe, app;

app = angular.module("app", []);

Kinvey.init({
  appKey: "kid_PVFkQeQG5M",
  appSecret: "7344648832814206b968007528346f52"
});

ForgotPass = function($scope, $rootScope, $http) {};

Signup = function($scope, $rootScope, $http) {
  $scope.username = "";
  $scope.password = "";
  $scope.email = "";
  return $scope.signup = function() {
    return Kinvey.User.create({
      username: $scope.username,
      password: $scope.password,
      email: $scope.email
    }, {
      success: function(user) {
        var entity;
        entity = new Kinvey.Entity({
          email: $scope.email
        }, "Customer");
        return entity.save({
          success: function(customer) {
            user.set("type", {
              customer_id: customer.get("_id")
            });
            return user.save({
              success: function() {
                $.mobile.changePage("#pageHome");
                return $rootScope.$emit("toHome", function() {});
              }
            });
          }
        });
      },
      error: function() {}
    });
  };
};

Splash = function($scope, $rootScope, $http) {
  $scope.username = "";
  $scope.password = "";
  $scope.login = function() {
    var user;
    user = new Kinvey.User();
    return user.login($scope.username, $scope.password, {
      success: function(user) {
        $.mobile.changePage("#pageHome");
        return $rootScope.$emit("toHome", function() {});
      },
      error: function() {}
    });
  };
  $scope.loginWithFacebook = function() {};
  return $scope.forgot = function() {
    var req;
    req = $http.get("/reset?username=" + $scope.username);
    return req.success(function() {
      return $.mobile.changePage("#pageForgotPass");
    });
  };
};

Days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

Home = function($scope, $rootScope) {
  $scope.firstName = "";
  $scope.lastName = "";
  $rootScope.$on("toHome", function() {
    var user;
    user = Kinvey.getCurrentUser();
    $scope.firstName = user.get("first_name");
    return $scope.lastName = user.get("last_name");
  });
  $scope.saveSettings = function() {
    var user;
    user = Kinvey.getCurrentUser();
    user.set("first_name", $scope.firstName);
    user.set("last_name", $scope.lastName);
    return user.save();
  };
  $scope.eatNow = function() {
    return $rootScope.$emit("toEatNow");
  };
  return $scope.eatLater = function() {
    return $rootScope.$emit("toEatLater");
  };
};

GraphRestLater = function($scope, $rootScope) {
  $scope.invervalTitle = "10:00";
  return $rootScope.$on("changeGraphRestLater", function(e, timeid) {
    return $scope.invervalTitle = timeid;
  });
};

SelectTimeLater = function($scope, $rootScope) {
  var current, hr, hrs, min, mins, twoDigits, _i, _j, _k, _len, _len1, _results;
  hrs = (function() {
    _results = [];
    for (_i = 0; _i <= 23; _i++){ _results.push(_i); }
    return _results;
  }).apply(this);
  mins = ["00", "15", "30", "45"];
  $scope.options = [];
  current = new Date();
  twoDigits = function(x) {
    return ("0" + x).slice(-2);
  };
  for (_j = 0, _len = hrs.length; _j < _len; _j++) {
    hr = hrs[_j];
    for (_k = 0, _len1 = mins.length; _k < _len1; _k++) {
      min = mins[_k];
      $scope.options.push("" + (twoDigits(hr)) + ":" + (twoDigits(min)));
    }
  }
  $scope.selected = "";
  $rootScope.$on("changeSelectTimeLater", function(e) {
    var tmpmin;
    hr = current.getHours();
    min = current.getMinutes();
    tmpmin = "";
    if ((52 <= min && min < 60) && (0 <= min && min < 7)) {
      tmpmin = "00";
    } else if ((7 <= min && min < 22)) {
      tmpmin = "15";
    } else if ((22 <= min && min <= 37)) {
      tmpmin = "30";
    } else if ((37 <= min && min <= 52)) {
      tmpmin = "45";
    }
    return $scope.selected = "" + (twoDigits(hr)) + ":" + (twoDigits(tmpmin));
  });
  return $scope.select = function() {
    return $rootScope.$emit("changeGraphRestLater", $scope.selected);
  };
};

GraphTimeLater = function($scope, $rootScope) {
  $scope.restTitle = "Boloco";
  return $rootScope.$on("changeGraphTimeLater", function(e, rest) {
    return $scope.restTitle = rest.name;
  });
};

SearchRestLater = function($scope, $rootScope, $http) {
  $scope.search = "";
  $scope.favorites = [
    {
      name: "Boloco",
      address: "Mass Ave",
      discount: "10",
      id: "xxxx"
    }, {
      name: "Boloco",
      address: "Mass Ave",
      discount: "10",
      id: "xxxx"
    }
  ];
  $scope.nearbys = [
    {
      name: "Boloco",
      address: "Mass Ave",
      discount: "10",
      id: "xxxx"
    }
  ];
  $rootScope.$on("changeSearchRestLater", function(e) {
    var req, url, user;
    console.log("doSearch");
    user = Kinvey.getCurrentUser();
    url = "/favorites?id=" + user.get("_id");
    req = $http.get(url);
    return req.success(function(data, status, headers, config) {
      console.log(data);
      $scope.favorites = [];
      return data.forEach(function(item) {
        return $scope.favorites.push(item);
      });
    });
  });
  $scope.lat = 42.38;
  $scope.long = -71.03;
  $scope.select = function(rest) {
    $rootScope.$emit("changeGraphTimeLater", rest);
    return $.mobile.changePage("#pageGraphTimeLater");
  };
  return $scope.doSearch = function() {};
};

EatNow = function($scope, $rootScope, $http, $timeout) {
  $scope.showMap = false;
  $scope.search = "";
  $scope.favorites = [
    {
      name: "Boloco",
      street_address: "Mass Ave",
      discount: "10",
      id: "xxxx"
    }, {
      name: "Boloco",
      street_address: "Mass Ave",
      discount: "10",
      id: "xxxx"
    }
  ];
  $scope.nearbys = [
    {
      name: "Boloco",
      street_address: "Mass Ave",
      discount: "10",
      id: "xxxx"
    }
  ];
  $scope.lat = 42.38;
  $scope.long = -71.03;
  $scope.select = function(rest) {
    console.log("select", arguments);
    $rootScope.$emit("changeEatNowRestaurant", rest);
    return $.mobile.changePage("#pageEatNowRestaurant");
  };
  $scope.doSearch = function() {};
  $scope.updateNearbys = function(nearbys) {
    var req, url;
    url = "/map";
    req = $http.get(url);
    req.success(function(data, status, headers, config) {
      $scope.mapSrc = data;
      return console.log("Map:", $scope.mapSrc);
    });
    return $scope.nearbys = nearbys;
  };
  $scope.mapSrc = "";
  $scope.tap = function(map) {
    return $scope.showMap = map;
  };
  return $rootScope.$on("toEatNow", function() {
    var req, url, user;
    user = Kinvey.getCurrentUser();
    url = "/favorites?user_id=" + user.get("type").customer_id;
    req = $http.get(url);
    req.success(function(data, status, headers, config) {
      $scope.favorites = [];
      return data.forEach(function(item) {
        return $scope.favorites.push(item);
      });
    });
    req.error(function(data, status, headers, config) {});
    url = "/nearbys?lat=" + $scope.lat + "&long=" + $scope.long + "&within=" + 1600;
    req = $http.get(url);
    req.success(function(data, status, headers, config) {
      console.log(data);
      return $scope.updateNearbys(data);
    });
    return req.error(function(data, status, headers, config) {});
  });
};

EatLater = function($scope, $http, $rootScope) {
  var atAtimeMove, atAtimeShow, dataHybrid, dataRestaurant, dataTime, getByRestaurant, getByTime, getHybrid, plot, plotGraph, processData, update;
  getHybrid = function(cb) {
    var dayW, req, today;
    today = new Date();
    dayW = Days[today.getDay()];
    req = $http.get("/pricesHybrid?day=" + dayW);
    req.success(function(data) {
      return cb(data);
    });
    return req.error(function() {});
  };
  getByTime = function(id, cb) {
    var dayW, req, today;
    today = new Date();
    dayW = Days[today.getDay()];
    req = $http.get("/pricesTime?restaurant=" + id + "&day=" + dayW);
    req.success(function() {
      return cb(data);
    });
    return req.error(function() {});
  };
  getByRestaurant = function(interval, cb) {
    var dayW, req, today;
    today = new Date();
    dayW = Days[today.getDay()];
    req = $http.get("/pricesRestaurant?interval=" + interval + "&day=" + dayW);
    req.success(function() {
      return cb(data);
    });
    return req.error(function() {});
  };
  $scope.title = "";
  $scope.type = "Hybrid";
  atAtimeShow = 6;
  atAtimeMove = 1;
  $scope.changeType = function(type) {};
  $scope.searchRestLater = function() {
    return $rootScope.$emit("changeSearchRestLater");
  };
  $scope.selectTimeLater = function() {
    return $rootScope.$emit("changeSelectTimeLater");
  };
  dataHybrid = [
    {
      label: "10:00",
      discount: 0.25,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:15",
      discount: 0.30,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:30",
      discount: 0.10,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:45",
      discount: 0.12,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:00",
      discount: 0.25,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:15",
      discount: 0.30,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:30",
      discount: 0.10,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }, {
      label: "10:45",
      discount: 0.12,
      name: "Boloco",
      street_address: "Mass Ave",
      id: "xxxx"
    }
  ];
  dataTime = [
    {
      label: "Boloco",
      discount: 0.25,
      interval: "10:00"
    }, {
      label: "Chipotle",
      discount: 0.30,
      interval: "10:00"
    }, {
      label: "Champion",
      discount: 0.10,
      interval: "10:00"
    }, {
      label: "Boloco",
      discount: 0.25,
      interval: "10:15"
    }, {
      label: "Chipotle",
      discount: 0.30,
      interval: "10:15"
    }, {
      label: "Champion",
      discount: 0.10,
      interval: "10:15"
    }
  ];
  dataRestaurant = [
    {
      label: "10:00",
      discount: 0.25,
      restaurant: "Boloco"
    }, {
      label: "10:15",
      discount: 0.30,
      restaurant: ""
    }, {
      label: "10:30",
      discount: 0.10
    }, {
      label: "10:45",
      discount: 0.12
    }, {
      label: "10:00",
      discount: 0.25
    }, {
      label: "10:15",
      discount: 0.30
    }, {
      label: "10:30",
      discount: 0.10
    }, {
      label: "10:45",
      discount: 0.12
    }
  ];
  $scope.init = function() {
    var data;
    $scope.all = dataHybrid;
    $scope.all.forEach(function(item) {
      return item.discount *= 100;
    });
    $scope.current = 0;
    data = $scope.all.slice($scope.current, $scope.current + atAtimeShow);
    return plot(data);
  };
  processData = function(data) {
    var discount, discounts, i, label, labels, ticks, _i, _j, _len, _len1;
    labels = _.pluck(data, "label");
    discounts = _.pluck(data, "discount");
    ticks = [];
    for (i = _i = 0, _len = labels.length; _i < _len; i = ++_i) {
      label = labels[i];
      ticks.push([i, label]);
    }
    data = [];
    for (i = _j = 0, _len1 = discounts.length; _j < _len1; i = ++_j) {
      discount = discounts[i];
      data.push([i, discount]);
    }
    return [data, ticks];
  };
  plotGraph = null;
  plot = function(data) {
    var css_id, options, ticks, _ref;
    _ref = processData(data), data = _ref[0], ticks = _ref[1];
    console.log(data);
    console.log(ticks);
    css_id = "#placeholder";
    data = [
      {
        data: data
      }
    ];
    options = {
      grid: {
        show: true,
        clickable: true
      },
      series: {
        stack: 0,
        bars: {
          show: true,
          barWidth: 1.0,
          align: "center"
        }
      },
      xaxis: {
        ticks: ticks
      }
    };
    plotGraph = $.plot($(css_id), data, options);
    $(css_id).unbind();
    return $(css_id).bind("plotclick", function(event, pos, item) {
      var selected;
      if (item) {
        console.log("item");
        selected = dataHybrid[$scope.current + item.dataIndex];
        $rootScope.$emit("changeEatNowRestaurant", selected);
        return $.mobile.changePage("#pageEatNowRestaurant");
      }
    });
  };
  $scope.init();
  update = function(newV) {
    var data;
    $scope.current = newV;
    data = $scope.all.slice($scope.current, $scope.current + atAtimeShow);
    $("#placehoder").empty();
    return plot(data);
  };
  $scope.prev = function() {
    var newV;
    newV = $scope.current - atAtimeMove;
    if (newV < 0) {
      return;
    }
    return update(newV);
  };
  return $scope.next = function() {
    var newV;
    newV = $scope.current + atAtimeMove;
    console.log(newV);
    console.log($scope.all.length);
    if (newV + atAtimeShow > $scope.all.length) {
      return;
    }
    return update(newV);
  };
};

Subscribe = function($scope) {};

LunchDate = function($scope) {};

ManageSubscriptions = function($scope) {};

AccountsPayments = function($scope) {};

EatNowRestaurant = function($scope, $rootScope, $timeout, $http) {
  var countDown, startCountDown, started, stopCountDown;
  $scope.name = "Boloco";
  $scope.quantitySelected = "1";
  $scope.timeLeft = 100;
  $scope.favorites = [
    {
      _id: "",
      name: "Beef Taco",
      price: 5.99
    }, {
      _id: "",
      name: "Chicken Burrito",
      price: 5.99
    }, {
      _id: "",
      name: "Rice & Bean Plate",
      price: 5.99
    }, {
      _id: "",
      name: "Steak Burrito",
      price: 5.99
    }
  ];
  $scope.itemSelected = $scope.favorites[0];
  $scope.discount = 10;
  started = false;
  startCountDown = function() {
    if (started) {
      return;
    }
    started = true;
    return countDown();
  };
  stopCountDown = function() {
    started = false;
    return countDown();
  };
  countDown = function() {
    var x;
    return $timeout(x = function() {
      $scope.timeLeft--;
      if (started) {
        return $timeout(x, 1000);
      }
    }, 1000);
  };
  $rootScope.$on("changeEatNowRestaurant", function(e, rest) {
    var req, user;
    $scope.name = rest.name;
    user = Kinvey.getCurrentUser();
    req = $http.get("/favoritesDish?user=" + user);
    req.success(function(data) {
      var d, min, second;
      d = new Date();
      min = d.getMinutes();
      second = d.getSeconds();
      $scope.favorites = data;
      $scope.itemSelected = $scope.favorites[0];
      $scope.timeLeft = 15 * 60 - (min * 60 + second) % (15 * 60);
      return startCountDown();
    });
    return req.error(function(data) {});
  });
  $scope.twoDigits = function(number) {
    return ("0" + (parseInt(number))).slice(-2);
  };
  return $scope.oneClick = function() {
    return $rootScope.$emit("confirmOrder", [
      {
        name: $scope.itemSelected.name,
        quantity: $scope.quantitySelected,
        price: $scope.itemSelected.price
      }
    ]);
  };
};

Confirm = function($scope, $rootScope) {
  var calculateTotal;
  $scope.carts = [
    {
      name: "Buffalo Burrito",
      quantity: 1,
      price: 5.99
    }
  ];
  $scope.total = 7.68;
  calculateTotal = function() {
    return $scope.total = $scope.carts.reduce(function(itema, itemb) {
      return {
        price: itema.price + itemb.price
      };
    }).price;
  };
  $rootScope.$on("confirmOrder", function(e, carts) {
    $scope.carts = carts;
    return calculateTotal();
  });
  return $scope.ok = function() {
    return history.back();
  };
};

RestaurantSubscriptionActive = function($scope) {};

CancelSubscription = function($scope) {};

FullMenuRestaurant = function($scope, $rootScope) {
  var calculateTotal;
  $scope.selectedQuantity = "1";
  $scope.menus = [
    {
      name: "Bangkok Thai Burrito",
      price: 5.99
    }, {
      name: "Buffalo Burrito",
      price: 5.99
    }, {
      name: "Chips & Guacamole",
      price: 2.69
    }
  ];
  $scope.selectedMenu = $scope.menus[0];
  $scope.name = "Boloco";
  $scope.carts = [
    {
      name: "Buffalo Burrito",
      quantity: 1,
      price: 5.99
    }, {
      name: "Chips & Guacamole",
      quantity: 1,
      price: 2.69
    }
  ];
  $scope.total = 7.68;
  calculateTotal = function() {
    return $scope.total = $scope.carts.reduce(function(itema, itemb) {
      return {
        price: itema.price + itemb.price
      };
    }).price;
  };
  $scope.addToCart = function() {
    $scope.carts.push({
      name: $scope.selectedMenu.name,
      price: $scope.selectedMenu.price,
      quantity: $scope.selectedQuantity
    });
    return calculateTotal();
  };
  $scope.oneClick = function() {
    return $rootScope.$emit("confirmOrder", [
      {
        name: $scope.selectedMenu.name,
        quantity: $scope.selectedQuantity,
        price: $scope.selectedMenu.price
      }
    ]);
  };
  return $scope.checkOut = function() {
    return $rootScope.$emit("confirmOrder", $scope.carts);
  };
};
