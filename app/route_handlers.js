var _       = require("underscore")._,
    path    = require("path"),
    fs      = require("fs"),

    // Custom helper stuff here
    file_helper  = require("./helpers.js")();


////////////////////////////////////////////////////////////////////////////////
// Define various application endpoint handlers
module.exports = function(SETTINGS) {

    // Return public interfaces
    return {

        ////////////////////////////////////////////////////////////////////////////////
        // Endpoint for "GET /"
        index: function(request, response)  {
            response.render("index", { "projects": SETTINGS.projects });
        },

        ////////////////////////////////////////////////////////////////////////////////
        // Endpoint for route error
        error: function(request, response) {
            response.render("error", { "message": request.url + " is not a valid endpoint"} );
        },

        ////////////////////////////////////////////////////////////////////////////////
        // Project specific endpoints
        // * Note that all of these are preceeded by the `validate_project` middleware
        //   which sets up the `response.locals.project` if applicable.
        project: {

            ////////////////////////////////////////////////////////////////////////////////
            // Endpoint for "GET /list/:project_name"
            list: function(request, response) {
                var project_name = request.params.project_name,
                    project      = response.locals.project,
                    ignore_paths = project["ignore_paths"] || [];

                file_helper.get_files_in_dir(project.path, ignore_paths, function(error, files) {
                    if (error) {
                        response.render("error", { "message": "Error encountered when fetching files. " + error });
                    } else {
                        response.render("list_project", {
                            "name": project.name,
                            "description": project.description,
                            "server": SETTINGS,
                            "files": files,
                        });
                    }
                });
            },

            ////////////////////////////////////////////////////////////////////////////////
            // Endpoint for "GET /bootstrap/:project_name"
            bootstrap: function(request, response) {
                var project_name = request.params.project_name,
                    project      = response.locals.project,
                    ignore_paths = project["ignore_paths"] || [];

                file_helper.get_files_in_dir(project.path, ignore_paths, function(error, files) {
                    if (error) {
                        response.render("error", { "message": "Error encountered when fetching files. " + error });
                    } else {
                        response.render("bootstrap", {
                            "name": project.name,
                            "server": SETTINGS,
                            "files": files
                        });
                    }
                });
            },

            ////////////////////////////////////////////////////////////////////////////////
            // Endpoint for "GET /get_file/:project_name/*"
            get_file: function(request, response) {
                var project_name   = request.params.project_name,
                    project        = response.locals.project,
                    file_sub_path  = path.dirname(request.params[0]),
                    file_root      = path.join(project.path, file_sub_path),
                    file_name      = path.basename(request.params[0]),
                    file_full_path = path.join(file_root, file_name),
                    send_options   = {
                        "root":     file_root,
                        "dotfiles": "deny",
                        "headers":  {
                            "x-timestamp":  Date.now(),
                            "x-sent":       true
                        }
                    };

                fs.exists(file_full_path, function(exists) {
                    if (!exists) {
                        console.log("file does not exist: " + file_full_path);
                        response.sendStatus(404);
                    } else {
                        // Send the file :)
                        response.sendFile(file_name, send_options, function(error) {
                            if (error) {
                                if (error.code === "ECONNABORT" && response.statusCode == 304) {
                                    // console.log("Ignored: " + file_full_path);
                                } else {
                                    console.log("Error: " + file_full_path + ". Error: " + error);
                                    response.status(error.status);
                                    response.end();
                                }
                            } else {
                                console.log("Sending: " + file_full_path);
                            }
                        });
                    }
                });
            },

        }

    };
};
