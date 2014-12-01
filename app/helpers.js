var _       = require("underscore")._,
    path    = require("path"),
    async   = require("async"),
    util    = require("util"),
    fs      = require("fs");


////////////////////////////////////////////////////////////////////////////////
// Extend function
Array.prototype.extend = function(array) {
    this.push.apply(this, array);
}

////////////////////////////////////////////////////////////////////////////////
module.exports = function() {

    ////////////////////////////////////////////////////////////////////////////////
    // Helper function to walk a dir and fetch all sub paths under it
    function _get_files_in_dir(base_path, sub_path, callback) {
        if (typeof(sub_path) == "function" && typeof(callback) == "undefined") {
            callback = sub_path;
            sub_path = ".";
        }

        var dir_path = path.join(base_path, sub_path),
            output   = [];

        async.waterfall([
            function list_files(next_step) {
                fs.readdir(dir_path, next_step);
            },
            function walk_dirs_list_files(files, next_step) {
                var parallel_fns = _.map(files, function(file) {
                    return function(inner_callback) {
                        var file_path       = path.join(dir_path, file),
                            file_rel_path   = path.join(sub_path, file);
                        async.waterfall([
                            function get_file_stat(next_step) {
                                fs.stat(file_path, next_step);
                            },
                            function recurse(file_info, next_step) {
                                if (file_info.isFile()) {
                                    output.push({
                                        "name": file,
                                        "path": file_rel_path,
                                        "mtime": file_info.mtime,
                                    });
                                    next_step();
                                } else {
                                    _get_files_in_dir(base_path, file_rel_path, function(error, recursive_results) {
                                        output.extend(recursive_results);
                                        next_step(error);
                                    });
                                }
                            },
                        ], inner_callback);
                    };
                });
                async.parallel(parallel_fns, function(error) {
                    next_step(error, output);
                });
            },
        ], function(error, result) {
            if (error) {
                console.log("Error: " + error);
            }
            callback(error, output);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////
    // [SYNC] Helper function to walk a dir and fetch all sub paths under it
    function _get_files_in_dir_sync(base_path, sub_path) {
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
                output.extend(_get_files_in_dir_sync(base_path, path.join(sub_path, file)));    
            }
        });
        return output;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Return public interfaces
    return {
        get_files_in_dir:       _get_files_in_dir,
        get_files_in_dir_sync:  _get_files_in_dir_sync,
    };
}
