app = angular.module "app", []
Kinvey.init
  appKey: "kid_PVFkQeQG5M"
  appSecret: "7344648832814206b968007528346f52"

# Create a new user instance, and login using supplied credentials.
# user = new Kinvey.User()
# user.login "username", "password",
#   success: (user) ->
#   # user is the logged in user instance.
#   error: (error) ->
