var _ = require("underscore")._;

////////////////////////////////////////////////////////////////////////////////
// Define various application middle-ware here
module.exports = function(SETTINGS) {

    return {

        ////////////////////////////////////////////////////////////////////////////////
        // This does nothing and forwards the call
        passthrough: function(request, response, next_route) {
            next_route();
        },

        ////////////////////////////////////////////////////////////////////////////////
        // This validates that the project being asked for is valid, and adds the project
        // info to the response so that the next_route knows what project its associated
        // with. This saves us form having to repeat the _.findWhere seen below.
        validate_project: function(request, response, next_route) {
            var project = _.findWhere(SETTINGS.projects, { "name": request.params.project_name });
            if (project) {
                response.locals.project = project;
                next_route();
            } else {
                response.render("error", {
                    "message": "Project " + request.params.project_name + " does not exist!"
                });
            }
        },

    };
};
