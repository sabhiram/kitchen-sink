# Kitchen-Sink

A general purpose node-based file-server

## Why in the world?

I typically edit files I want to deploy to random linux servers on my laptop. While I am sure the vi hackers of the world are shaking their fists violently at this page, I tend to prefer a nice sublimey interface. 

So, enter kitchen-sink, for all your sinking needs.

## Fetching and install

    git clone git@github.com:sabhiram/kitchen-sink.git
    npm install
    echo {"services": []} > config.json
    npm start

## Run some tests

    npm install --dev
    npm test

## Sample Config file

*Sample config.json file*

Note: Absolute paths do not work just yet...

    {
        "port": 2674,
        "services": [
        {
                "name": "absolute",
                "description": "Absolute path sub-folder",
                "path": "/services_a/project"
            },
            {
                "name": "relative",
                "description": "Relative path sub-folder",
                "path": "../parent/child/project"
            }
        ]
    }


## API

#### GET /

Homepage, will list all projects registered with the server via `config.json`, with clickable links to the `GET /list/:project_name`

#### GET /list/:project_name

Per-project page with a list of all files in the project, as well as a link to a "bootstrap" file which when run can hit this server to pull all files in said project

#### GET /bootstrap/:project_name

Fetches a `init.sh`-esq file which can be used to fetch all files from the given sub-project to the current directory. You can also pipe this file to a shell like so:

    wget http://<server>:<port>/bootstrap/:project_name -O - | sh

or the more traditional:

    wget http://<server>:<port>/bootstrap/:project_name -O bootstrap.sh
    chmod u+x bootstrap.sh
    ./bootstrap.sh

#### GET /get_file/:project_name/:file_path

Fetches a file in a given sub-folder. The headers are setup appropriately that the reciever can only re-update and fetch on file mtime change (last modified time). This is particularly useful in the context of cpp files (for ex), which cause re-compiliation of objects on mtime change (which will always occur if we blindly replace the file). 

Here is how you can go about fetching a file and checking to see if it needs to be pulled down:

    curl http://<server>:<port>/bootstrap/:project_name/:file_path --create-dirs -z :file_path -o :file_path

## TODOs:

1. Moar tests
2. Does it make sense to have a fetch compressed?
3. The config file needs to be maintainable from the web GUI, and by way of manual edits...
4. Handle absolute paths in project 
5. There is no default config file, elegantify this whole ordeal
