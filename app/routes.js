////////////////////////////////////////////////////////////////////////////////
// Routes file which pairs our server's HTTP handlers
// to the ReSTy interface we provide...
module.exports = function(app, middleware, handlers) {
    /*  Handler -------------------------------------------------------------------------------------------------o */
    /*  Middleware ------------------------------------------------------------o                                 | */
    /*  URL ----------------------------o                                      |                                 | */
    /*                                  |                                      |                                 | */
    //                                  |                                      |                                 |
    // Home page                        |                                      |                                 | */
    app.get(                           "/",               middleware.passthrough,                   handlers.index );
    //                                  |                                      |                                 |
    // Project endpoints                |                                      |                                 |
    app.get(         "/list/:project_name",          middleware.validate_project,            handlers.project.list );
    app.get(    "/bootstrap/:project_name",          middleware.validate_project,       handlers.project.bootstrap );
    app.get(   "/get_file/:project_name/*",          middleware.validate_project,        handlers.project.get_file );
    //                                  |                                      |                                 |
    // 404 - *MUST* be last             |                                      |                                 |
    app.get(                           "*",               middleware.passthrough,                   handlers.error );
    // NO MORE ROUTES HERE... add them before the 404 page!
};

