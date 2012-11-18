#Page
Home = ($scope)->
  $scope.firstName = ""
  $scope.lastName = ""
  $scope.saveSettings = ->
    user = Kinvey.getCurrentUser()
    user.set "first_name", $scope.firstName
    user.set "last_name", $scope.lastName
    user.save()

EatNow = ($scope, $rootScope, $http, $timeout)->
  $scope.showMap = false
  $scope.search = ""
  $scope.favorites = [
    name: "Boloco"
    address: "Mass Ave"
    discount: "10"
    id: "xxxx"
  ,
    name: "Boloco"
    address: "Mass Ave"
    discount: "10"
    id: "xxxx"  
  ]
  $scope.nearbys = [
    name: "Boloco"
    address: "Mass Ave"
    discount: "10"
    id: "xxxx"    
  ]
  $scope.furthers = [
    name: "Boloco"
    address: "Mass Ave"
    discount: "10"
    id: "xxxx"    
  ]
  $scope.location = [52.2100, 0.1300]
  $scope.select = (id)->
    console.log "select", arguments
    $rootScope.$emit "changeEatNowRestaurant",id
    $.mobile.changePage "#pageEatNowRestaurant"
  $scope.doSearch = ->
    user = Kinvey.getCurrentUser()
    url = "/favorites?id="+user.get "_id"
    req = $http.get url
    req.success (data, status, headers, config)->
      $scope.favorites = data.favorites
    req.error (data, status, headers, config)->

    url = "/nearbys?q=#{$scope.search}&loc=#{$scope.location}&within=#{1600}"
    req = $http.get url
    req.success (data, status, headers, config)->
      $scope.nearbys = data.nearbys
    req.error (data, status, headers, config)->

    url = "/furthers?q=#{$scope.search}&loc=#{$scope.location}"
    req = $http.get url
    req.success (data, status, headers, config)->
      $scope.furthers = data.furthers
    req.error (data, status, headers, config)->

  $scope.tap = (map)->
    $scope.showMap = map
    $timeout x=->
      console.log $scope.showMap
      $timeout x, 1000
    , 1000
    
EatLater = ($scope)->
  
Today = ($scope)->
Tomorrow = ($scope)->
Subscribe = ($scope)->
LunchDate = ($scope)->
ManageSubscriptions = ($scope)->
AccountsPayments = ($scope)->
EatNowRestaurant = ($scope, $rootScope, $timeout)->
  $scope.name = "Boloco"
  $scope.quantitySelected = "1"
  $scope.timeLeft = 100 #in second
  $scope.itemSelected = "Beef Taco"
  $scope.favorites = ["Beef Taco","Chicken Burrito","Rice & Bean Plate","Steak Burrito"]
  $scope.discount = 10
  started = false
  startCountDown = ->
    if started
      return
    started = true
    countDown()
  stopCountDown = ->
    started = false
    countDown()
  countDown = ->
    $timeout x=->
      $scope.timeLeft--
      if started
        $timeout x, 1000
    , 1000
  $rootScope.$on "changeEatNowRestaurant", (e, id)->
    startCountDown()
  $scope.twoDigits = (number)->
    return ("0#{parseInt(number)}").slice(-2)
  
RestaurantSubscriptionActive = ($scope)->
CancelSubscription = ($scope)->
  
FullMenuRestaurant = ($scope)->
  $scope.selectedQuantity = "1"
  $scope.menus = [
    name: "Bangkok Thai Burrito"
    price: 5.99
  ,
    name: "Buffalo Burrito"
    price: 5.99
  ,
    name: "Chips & Guacamole"
    price: 2.69
  ]
  $scope.selectedMenu = $scope.menus[0]
  $scope.name = "Boloco"
  $scope.carts = [
    name: "Buffalo Burrito"
    quantity: 1
    price: 5.99
  ,
    name: "Chips & Guacamole"
    quantity: 1
    price: 2.69
  ]
  $scope.total = 7.68
  calculateTotal = ->
    $scope.total = $scope.carts.reduce (itema,itemb)->
      {price: itema.price+itemb.price}
    .price
  calculateTotal()   
  $scope.addToCart = ()->
    $scope.carts.push 
      name: $scope.selectedMenu.name
      price: $scope.selectedMenu.price
      quantity: $scope.selectedQuantity      
    calculateTotal()
  $scope.oneClick = ->
  $scope.checkOut = ->


