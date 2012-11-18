ForgotPass = ($scope,$rootScope,$http)->
  
Signup = ($scope,$rootScope, $http)->
  $scope.username = ""
  $scope.password = ""
  $scope.email = ""  
  $scope.signup =->
    Kinvey.User.create
      username: $scope.username
      password: $scope.password
      email: $scope.email
    ,
      success: (user)->
        entity = new Kinvey.Entity
          email: $scope.email
        , "Customer"
        entity.save
          success: (customer)->
            user.set "type",
              customer_id: customer.get "_id"
            user.save
              success: ->
                $.mobile.changePage "#pageHome"
                $rootScope.$emit "toHome", ->
        
      error: ->

Splash = ($scope,$rootScope,$http)->
  $scope.username = ""
  $scope.password = ""
  $scope.login =->
    user = new Kinvey.User()
    user.login $scope.username, $scope.password,
      success: (user)->
        $.mobile.changePage "#pageHome"
        $rootScope.$emit "toHome", ->
      error: ->
  $scope.loginWithFacebook = ->
    #TODO
  $scope.forgot =-> 
    req = $http.get "/reset?username=#{$scope.username}"
    req.success ->
      $.mobile.changePage "#pageForgotPass"

#Page
Days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
Home = ($scope,$rootScope)->
  $scope.firstName = ""
  $scope.lastName = ""
  $rootScope.$on "toHome", ->
    user = Kinvey.getCurrentUser()
    $scope.firstName =user.get "first_name"
    $scope.lastName =user.get "last_name"
  $scope.saveSettings = ->
    user = Kinvey.getCurrentUser()
    user.set "first_name", $scope.firstName
    user.set "last_name", $scope.lastName
    user.save()
  $scope.eatNow = ->
    $rootScope.$emit "toEatNow"
  $scope.eatLater = ->
    $rootScope.$emit "toEatLater"
    
GraphRestLater = ($scope,$rootScope)->
  $scope.invervalTitle = "10:00"
  $rootScope.$on "changeGraphRestLater", (e,timeid)->
    $scope.invervalTitle = timeid

SelectTimeLater = ($scope,$rootScope)->
  hrs = [0..23]
  mins = ["00","15","30","45"]
  $scope.options = []
  current = new Date()
  twoDigits = (x)->
    ("0"+x).slice -2    
  for hr in hrs
    for min in mins
      $scope.options.push "#{twoDigits(hr)}:#{twoDigits(min)}"
  $scope.selected = ""
  $rootScope.$on "changeSelectTimeLater", (e)->
    hr = current.getHours()
    min = current.getMinutes()
    # console.log "min",min
    tmpmin = ""
    if 52<=min<60 and 0<=min<7
      tmpmin = "00"
    else if 7<=min<22
      tmpmin = "15"
    else if 22<=min<=37
      tmpmin = "30"
    else if 37<=min<=52
      tmpmin = "45"
    # console.log tmpmin
    $scope.selected = "#{twoDigits(hr)}:#{twoDigits(tmpmin)}"
    # console.log $scope.selected 
  $scope.select = ->
    $rootScope.$emit "changeGraphRestLater", $scope.selected

GraphTimeLater = ($scope,$rootScope)->
  $scope.restTitle = "Boloco"
  $rootScope.$on "changeGraphTimeLater", (e,rest)->
    $scope.restTitle = rest.name
  
SearchRestLater = ($scope,$rootScope,$http)->
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
  $rootScope.$on "changeSearchRestLater",(e)->
    console.log "doSearch"
    user = Kinvey.getCurrentUser()
    url = "/favorites?id="+user.get "_id"
    req = $http.get url
    req.success (data, status, headers, config)->
      console.log data
      $scope.favorites = []
      data.forEach (item)->
        $scope.favorites.push item
  $scope.lat = 42.38
  $scope.long = -71.03
  $scope.select = (rest)->
    $rootScope.$emit "changeGraphTimeLater",rest
    $.mobile.changePage "#pageGraphTimeLater"
  $scope.doSearch = ->
    # req.error (data, status, headers, config)->
    # url = "/nearbys?lat=#{$scope.lat}&long=#{$scope.long}&within=#{1600}"
    # req = $http.get url
    # req.success (data, status, headers, config)->
    #   $scope.nearbys = data.nearbys
    # req.error (data, status, headers, config)->
 
EatNow = ($scope, $rootScope, $http, $timeout)->
  $scope.showMap = false
  $scope.search = ""
  $scope.favorites = [
    name: "Boloco"
    street_address: "Mass Ave"
    discount: "10"
    id: "xxxx"
  ,
    name: "Boloco"
    street_address: "Mass Ave"
    discount: "10"
    id: "xxxx"  
  ]
  $scope.nearbys = [
    name: "Boloco"
    street_address: "Mass Ave"
    discount: "10"
    id: "xxxx"    
  ]

  $scope.lat = 42.38
  $scope.long = -71.03
  $scope.select = (rest)->
    console.log "select", arguments
    $rootScope.$emit "changeEatNowRestaurant",rest
    $.mobile.changePage "#pageEatNowRestaurant"
  $scope.doSearch = ->
    
  $scope.updateNearbys = (nearbys)->
    url = "/map"
    req = $http.get url
    req.success (data, status, headers, config)->
      $scope.mapSrc = data
      console.log "Map:",$scope.mapSrc
    $scope.nearbys = nearbys
    # nearbys.forEach (nearby)->
  $scope.mapSrc = ""
  $scope.tap = (map)->
    $scope.showMap = map
  $rootScope.$on "toEatNow", ->
    user = Kinvey.getCurrentUser()
    url = "/favorites?user_id="+user.get("type").customer_id
    req = $http.get url
    req.success (data, status, headers, config)->
      # console.log data
      $scope.favorites = []
      data.forEach (item)->
        # console.log item.street_address
        $scope.favorites.push item
    req.error (data, status, headers, config)->

    url = "/nearbys?lat=#{$scope.lat}&long=#{$scope.long}&within=#{1600}"
    req = $http.get url
    req.success (data, status, headers, config)->
      console.log data
      $scope.updateNearbys data
      
    req.error (data, status, headers, config)->
    
    
EatLater = ($scope, $http, $rootScope)->
  getHybrid = (cb)->
    today = new Date()
    dayW = Days[today.getDay()]
    req = $http.get "/pricesHybrid?day=#{dayW}"
    req.success (data)->
      cb data
    req.error ->
  getByTime = (id, cb)->
    today = new Date()
    dayW = Days[today.getDay()]
    req = $http.get "/pricesTime?restaurant=#{id}&day=#{dayW}"
    req.success ->
      cb data
    req.error ->    
  getByRestaurant = (interval, cb)->
    today = new Date()
    dayW = Days[today.getDay()]
    req = $http.get "/pricesRestaurant?interval=#{interval}&day=#{dayW}"
    req.success ->
      cb data
    req.error ->
  $scope.title = ""
  $scope.type = "Hybrid"
  atAtimeShow = 6
  atAtimeMove = 1
  $scope.changeType = (type)->
    
  $scope.searchRestLater = ->
    $rootScope.$emit "changeSearchRestLater"
  $scope.selectTimeLater = ->
    $rootScope.$emit "changeSelectTimeLater"

  dataHybrid = [
    label: "10:00"
    discount: 0.25
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:15"
    discount: 0.30  
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:30"
    discount: 0.10  
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:45"
    discount: 0.12
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:00"
    discount: 0.25
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:15"
    discount: 0.30  
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:30"
    discount: 0.10  
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ,
    label: "10:45"
    discount: 0.12
    name: "Boloco"
    street_address: "Mass Ave"
    id: "xxxx"
  ]

  dataTime = [
    label: "Boloco"
    discount: 0.25
    interval: "10:00"
  ,
    label: "Chipotle"
    discount: 0.30  
    interval: "10:00"
  ,
    label: "Champion"
    discount: 0.10  
    interval: "10:00"
  ,
    label: "Boloco"
    discount: 0.25
    interval: "10:15"
  ,
    label: "Chipotle"
    discount: 0.30  
    interval: "10:15"
  ,
    label: "Champion"
    discount: 0.10  
    interval: "10:15"
  ]
  
  dataRestaurant = [
    label: "10:00"
    discount: 0.25
    restaurant: "Boloco"
  ,
    label: "10:15"
    discount: 0.30  
    restaurant: ""
  ,
    label: "10:30"
    discount: 0.10  
  ,
    label: "10:45"
    discount: 0.12
  ,
    label: "10:00"
    discount: 0.25
  ,
    label: "10:15"
    discount: 0.30  
  ,
    label: "10:30"
    discount: 0.10  
  ,
    label: "10:45"
    discount: 0.12
  ]
    
  $scope.init = ->
    # getHybrid (data)->
    $scope.all = dataHybrid
    $scope.all.forEach (item)->
      item.discount*=100
    $scope.current = 0
    data = $scope.all.slice $scope.current,$scope.current+atAtimeShow
    plot(data)
  processData = (data)->
    labels = _.pluck data, "label"
    discounts = _.pluck data, "discount"
    ticks = []
    for label,i in labels
      ticks.push [i,label]
    data = []
    for discount,i in discounts
      data.push [i,discount]
    [data, ticks]
  plotGraph = null
  plot = (data)->
    [data,ticks] = processData data
    console.log data
    console.log ticks
    css_id = "#placeholder"
    data = [
      data: data
    ]
    options =
      grid:
        show: true
        clickable: true
      series:
        stack: 0
        bars:
          show: true
          barWidth: 1.0
          align: "center"
      xaxis:
        ticks: ticks

    plotGraph = $.plot $(css_id), data, options
    $(css_id).unbind()
    $(css_id).bind "plotclick", (event, pos, item) ->
      if (item)
        console.log "item"
        selected = dataHybrid[$scope.current+item.dataIndex]
        $rootScope.$emit "changeEatNowRestaurant", selected
        $.mobile.changePage "#pageEatNowRestaurant"
  $scope.init()
  
  update = (newV)->
    $scope.current = newV
    data = $scope.all.slice $scope.current,$scope.current+atAtimeShow
    $("#placehoder").empty()
    plot data
    # plotGraph = $.plot $("#placehoder"), data, options
    # plotGraph.setData [
    #   data:data
    # ]
    # plotGraph.getAxes().xaxis.ticks = ticks
    # plotGraph.draw()    
  $scope.prev = ->
    newV = $scope.current-atAtimeMove
    if newV < 0
      return
    update(newV)
    
  $scope.next = ->
    newV = $scope.current+atAtimeMove
    console.log newV
    console.log $scope.all.length
    if newV+atAtimeShow > $scope.all.length
      return
    update(newV)
  
Subscribe = ($scope)->
LunchDate = ($scope,$http)->
  $scope.invite = ->
    window.location.pathname = "/facebook"
    # req = $http.get "/facebook"
    # req.success ->
    # req.error ->

ManageSubscriptions = ($scope)->
AccountsPayments = ($scope)->

#Done
EatNowRestaurant = ($scope, $rootScope, $timeout, $http)->
  $scope.name = "Boloco"
  $scope.quantitySelected = "1"
  $scope.timeLeft = 100 #in second
  $scope.invite = ->
    window.location.pathname = "/facebook"    
  $scope.favorites = [
    _id: ""
    name: "Beef Taco"
    price: 5.99
  ,
    _id: ""
    name: "Chicken Burrito"
    price: 5.99
  ,
    _id: ""
    name: "Rice & Bean Plate"
    price: 5.99
  ,
    _id: ""
    name: "Steak Burrito"
    price: 5.99
  ]
  $scope.itemSelected = $scope.favorites[0]
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
  $rootScope.$on "changeEatNowRestaurant", (e, rest)->
    $scope.name = rest.name
    user = Kinvey.getCurrentUser()
    req = $http.get "/favoritesDish?user=#{user}"
    req.success (data)->
      d = new Date()
      min = d.getMinutes()
      second = d.getSeconds()
      $scope.favorites = data
      $scope.itemSelected = $scope.favorites[0]
      $scope.timeLeft = 15*60-(min*60+second)%(15*60)
      startCountDown()
    req.error (data)->
  $scope.twoDigits = (number)->
    return ("0#{parseInt(number)}").slice(-2)
  $scope.oneClick = ->
    $rootScope.$emit "confirmOrder", [
      name: $scope.itemSelected.name
      quantity: $scope.quantitySelected
      price: $scope.itemSelected.price
    ]

Confirm = ($scope,$rootScope)->
  $scope.carts = [
    name: "Buffalo Burrito"
    quantity: 1
    price: 5.99
  ]
  $scope.total = 7.68
  calculateTotal = ->
    $scope.total = $scope.carts.reduce (itema,itemb)->
      {price: itema.price+itemb.price}
    .price
  $rootScope.$on "confirmOrder", (e,carts)->
    $scope.carts = carts
    calculateTotal()
  $scope.ok = ->
    history.back()

RestaurantSubscriptionActive = ($scope)->
CancelSubscription = ($scope)->
  
FullMenuRestaurant = ($scope, $rootScope)->
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
  # calculateTotal()   
  $scope.addToCart = ()->
    $scope.carts.push 
      name: $scope.selectedMenu.name
      price: $scope.selectedMenu.price
      quantity: $scope.selectedQuantity      
    calculateTotal()
  $scope.oneClick = ->
    $rootScope.$emit "confirmOrder", [
      name: $scope.selectedMenu.name
      quantity: $scope.selectedQuantity
      price: $scope.selectedMenu.price
    ]
  $scope.checkOut = ->
    $rootScope.$emit "confirmOrder", $scope.carts
    


