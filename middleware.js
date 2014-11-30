/*****************************************************************************\
    Define various application middle-ware here
\*****************************************************************************/
module.exports = function() {
    return {

        // This does nothing and forwards the call
        passthrough: function(request, response, next_route) {
            next_route();
        },

        // This validates that the project being asked for is valid
        validate_project: function(request, response, next_route) {
            var project_name = request.params.project_name;
            console.log(project_name);
            next_route();
        },

    };
};