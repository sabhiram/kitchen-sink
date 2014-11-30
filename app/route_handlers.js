var _       = require("underscore")._,
    path    = require("path"),
    fs      = require("fs");


////////////////////////////////////////////////////////////////////////////////
// Extend function
Array.prototype.extend = function(array) {
    this.push.apply(this, array);
}

////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////
// Define various application endpoint handlers
module.exports = function(SETTINGS) {

    // Return public interfaces
    return {
        
        ////////////////////////////////////////////////////////////////////////////////
        // Endpoint for "GET /"
        index: function(request, response)  {
            response.render("index", { "services": SETTINGS.services });
        },

        ////////////////////////////////////////////////////////////////////////////////
        // Endpoint for route error
        error: function(request, response) {
            response.render("error", { "message": request.url + " is not a valid endpoint"} );
        },

        ////////////////////////////////////////////////////////////////////////////////
        // Project specific endpoints
        project: {

            ////////////////////////////////////////////////////////////////////////////////
            // Endpoint for "GET /list/:project_name"
            list: function(request, response) {
                var project_name = request.params.project_name,
                    project      = _.findWhere(SETTINGS.services, { "name": project_name });

                response.render("list_project", {
                    "name": project.name,
                    "description": project.description,
                    "server": SETTINGS,
                    "files": get_files_in_dir_sync(project.path),
                });
            },

            ////////////////////////////////////////////////////////////////////////////////
            // Endpoint for "GET /bootstrap/:project_name"
            bootstrap: function(request, response) {
                var project_name = request.params.project_name,
                    project      = _.findWhere(SETTINGS.services, {"name": project_name});

                response.render("bootstrap", {
                    "name": project.name,
                    "server": SETTINGS,
                    "files": get_files_in_dir_sync(project.path)
                });
            },

            ////////////////////////////////////////////////////////////////////////////////
            // Endpoint for "GET /get_file/:project_name/*"
            // TODO: Asyncize this :)
            get_file: function(request, response) {
                var project_name = request.params.project_name,
                    project      = _.findWhere(SETTINGS.services, { "name": project_name }),
                    file_sub_path   = path.dirname(request.params[0]),
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
            },

        }

    };
};