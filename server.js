////////////////////////////////////////////////////////////////////////////////
var os      = require("os"),
    path    = require("path"),

    // External deps
    express = require("express"),
    _       = require("underscore")._,

    // Setup app instance
    app = express(),
    
    // Grab app settings
    SETTINGS    = require("./config.json");


////////////////////////////////////////////////////////////////////////////////
// Fix up some settings like the url etc, also
// default params for required vars
SETTINGS.url  = "http://" + os.hostname();
SETTINGS.port = SETTINGS.port || 1234;


////////////////////////////////////////////////////////////////////////////////
// Configure the express app
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
app.set("trust proxy", true);

// Point _ to the app locals so we can refer to it from
// the ejs templates
app.locals._ = _;


////////////////////////////////////////////////////////////////////////////////
// Define application routes
var middleware = require("./app/middleware.js")(SETTINGS);
var handlers   = require("./app/route_handlers.js")(SETTINGS); 
require("./app/routes.js")(app, middleware, handlers);


////////////////////////////////////////////////////////////////////////////////
// Start server
console.log("\nServer up at " + SETTINGS.url + ":" + SETTINGS.port);
app.listen(SETTINGS.port);