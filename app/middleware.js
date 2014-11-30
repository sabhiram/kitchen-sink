var _ = require("underscore")._;

/*****************************************************************************\
    Define various application middle-ware here
\*****************************************************************************/
module.exports = function(SETTINGS) {
    return {

        // This does nothing and forwards the call
        passthrough: function(request, response, next_route) {
            next_route();
        },

        // This validates that the project being asked for is valid
        validate_project: function(request, response, next_route) {
            if(_.findWhere(SETTINGS.services, { "name": request.params.project_name })) {
                next_route();
            } else {
                response.render("error", {
                    "message": "Project "+request.params.project_name+"does not exist!"
                });
            }
        },

    };
};