var util    = require("util"),
    path    = require("path"),
    os      = require("os"),
    fs      = require("fs"),

    // External deps
    express = require("express"),
    _       = require("underscore")._,

    // The dir which holds our various dockerfiles
    SERVICES_DIR = path.join(__dirname, "services"),
    
    // Setup app instance
    app = express(),

    // Grab app settings
    SETTINGS            = require("./config.json");

// Fix up some settings like the url etc, also
// default params for required vars
SETTINGS.url  = "http://" + os.hostname(),
SETTINGS.port = SETTINGS.port || 1234;

// Configure the express app
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
app.set("trust proxy", true);

// Point _ to the app locals so we can refer to it from
// the ejs templates
app.locals._ = _;

// TODO: This should be a auto-generated API object which is injected into
// a "view" for main. This way it is much easier to control how this renders
// if at all..
var API_MSG = [
    "Here are the APIs which this server implements:",
    "",
    " * GET /",
    " --> Fetches this help page",
    " * GET /list_all",
    " --> Lists all sub projects exposed via this server",
    " * GET /list/:project",
    " --> Lists all files / folders under the subproject",
    " * GET /services/:project/:file/:path",
    " --> Fetches the given file"
].join("<br>\n");

app.get("/", function(request, response) {
    response.send(API_MSG);
    response.end();
});

// API to fetch all projects under the services dir
app.get("/list_all", function(request, response) {
    response.render("list_all", { "services": SETTINGS.services });
});

// TODO: All project apis should probably go through a validate project
// middleware which validates that the project exists in the settings etc

// List (sub) project details for a given project
app.get("/list/:project", function(request, response) {
    var project_name = request.params.project,
        project      = _.findWhere(SETTINGS.services, {"name": project_name});
    if(project) {
        response.render("list_project", {
            "name": project.name,
            "description": project.description,
            "server": SETTINGS,
            "file_info": get_files_in_dir_sync(project.path),
        });
    } else {
        response.render("error", {
            "message": "Project "+project_name+"does not exist!"
        });
    }
});

// Fetch a bootstrap file(sh), which fetches all files from that
// sub-project
app.get("/bootstrap/:project", function(request, response) {
    var project_name = request.params.project,
        project      = _.findWhere(SETTINGS.services, {"name": project_name});
    if(project) {
        response.render("bootstrap", {
            "name": project.name,
            "server": SETTINGS,
            "files": get_files_in_dir_sync(project.path)
        });        
    } else {
        response.render("error", {
            "message": project + " does not exist!"
        });
    }
});

app.get("/get_file/:project/*", function(request, response) {
    var project_name = request.params.project,
        project      = _.findWhere(SETTINGS.services, {"name": project_name});
    if(project) {
        var file_sub_path   = path.dirname(request.params[0]),
            file_root       = path.join(project.path, file_sub_path),
            file_name       = path.basename(request.params[0]),
            file_full_path  = path.join(file_root, file_name),
            send_options    = {
                "root":     file_root,
                "dotfiles": "deny",
                "headers":  {
                    "x-timestamp":  Date.now(),
                    "x-sent":       true
                }
            };

        fs.exists(file_full_path, function(exists) {
            if(!exists) {
                console.log("file does not exist: " + file_full_path);
                response.send(404);
            } else {
                // Send the file :)
                response.sendFile(file_name, send_options, function(error) {
                    if (error) {
                        if (error.code === "ECONNABORT" && response.statusCode == 304) {
                            console.log("Ignored: " + file_full_path);
                        } else {
                            console.log("Error: " + file_full_path + ". Error: " + error);
                            response.status(error.status);
                            response.end();
                        }
                    } else {
                        console.log("Sent: " + file_full_path);
                    }
                });
            }
        });
    } else {
        console.log(project_dir + " does not exist!");
        response.send(404); 
    }
});

console.log("\nServer up at " + SETTINGS.url + ":" + SETTINGS.port);
app.listen(SETTINGS.port);


// Helper function to walk a dir and fetch all sub paths under it
function get_files_in_dir_sync(base_path, sub_path) {
    var sub_path = sub_path || ".",
        dir_path = path.join(base_path, sub_path),
        files = fs.readdirSync(dir_path);

    var output = [];
    _.each(files, function(file) {
        var file_path       = path.join(dir_path, file),
            file_rel_path   = path.join(sub_path, file),
            file_stats      = fs.statSync(file_path);

        // If its a file, we just add to the output
        if (file_stats.isFile()) {
            output.push({
                "name": file,
                "path": file_rel_path,
                "mtime": file_stats.mtime,
            });
        }
        // Otherwise, recurse...
        else {
            output.extend(get_files_in_dir_sync(base_path, path.join(sub_path, file)));    
        }
    });
    return output;
}

// Extend function
Array.prototype.extend = function(array) {
    this.push.apply(this, array);
}
