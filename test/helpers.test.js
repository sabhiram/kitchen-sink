var should  = require("should"),
    async   = require("async"),
    path    = require("path"),
    fs      = require("fs");


////////////////////////////////////////////////////////////////////////////////
describe("Test Folder Walking", function() {
    var file_helper     = require("../app/helpers")(),
        fixture_dir     = path.join(__dirname, "_temp_fixtures"),
        folder_a        = path.join(fixture_dir, "folder_a"),
        folder_b        = path.join(fixture_dir, "folder_b"),
        folder_b_b      = path.join(fixture_dir, "folder_b_b"),
        file_a_a        = path.join(folder_a, "a.txt"),
        file_b_b        = path.join(folder_b, "b.txt"),
        file_b_b_b      = path.join(folder_b_b, "b.txt");

    ////////////////////////////////////////////////////////////////////////////////
    // Setup
    before(function(done) {
        
        /* Lets create a mock folder structure here... something like:
        _temp_fixtures/folder_a/a.txt
        _temp_fixtures/folder_b/folder_b/b.txt
        _temp_fixtures/folder_b/b.txt 
        */
        async.series([
            function clean_fixture_dir(next_step) {
                if (fs.existsSync(fixture_dir)) {
                    fs.rmdir(fixture_dir, next_step);
                } else {
                    next_step();
                }
            },
            function make_fixture_dir(next_step) {
                fs.mkdir(fixture_dir, next_step);
            },
            function make_folders(next_step) {
                fs.mkdirSync(folder_a);
                fs.mkdirSync(folder_b);
                fs.mkdirSync(folder_b_b);
                next_step();
            },
            function touch_files(next_step) {
                fs.openSync(file_a_a, 'w');
                fs.openSync(file_b_b, 'w');
                fs.openSync(file_b_b_b, 'w');
                next_step();
            },
        ], done);
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Cleanup
    after(function(done) {
        async.series([
            function remove_files(next_step) {
                fs.unlinkSync(file_a_a);
                fs.unlinkSync(file_b_b);
                fs.unlinkSync(file_b_b_b);
                next_step();
            },
            function remove_folders(next_step) {
                fs.rmdirSync(folder_a);
                fs.rmdirSync(folder_b);
                fs.rmdirSync(folder_b_b);
                next_step();
            },
            function clean_fixture_dir(next_step) {
                if (fs.existsSync(fixture_dir)) {
                    fs.rmdirSync(fixture_dir, next_step);
                }
                next_step();
            },
        ], done);
    });

    ////////////////////////////////////////////////////////////////////////////////
    it("Validate fixture dirs", function(next_test) {
        fs.existsSync(file_a_a).should.be.true;
        fs.existsSync(file_b_b).should.be.true;
        fs.existsSync(file_b_b_b).should.be.true;
        next_test();
    });

    ////////////////////////////////////////////////////////////////////////////////
    it("test get_files_in_dir", function(next_test) {
        file_helper.get_files_in_dir(fixture_dir, function(error, results) {
            results.length.should.be.exactly(3);
            next_test();
        });
    });

    ////////////////////////////////////////////////////////////////////////////////
    it("test get_files_in_dir_sync", function(next_test) {
        var results = file_helper.get_files_in_dir_sync(fixture_dir);
        results.length.should.be.exactly(3);
        next_test();
    });
});
