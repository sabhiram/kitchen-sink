# Kitchen-Sink

[![Build Status](https://travis-ci.org/sabhiram/kitchen-sink.svg?branch=master)](https://travis-ci.org/sabhiram/kitchen-sink) [![Coverage Status](https://coveralls.io/repos/sabhiram/kitchen-sink/badge.png)](https://coveralls.io/r/sabhiram/kitchen-sink)

A general purpose node-based file-server

## Why in the world?

I typically edit files I want to deploy to random linux servers on my laptop. While I am sure the vi hackers of the world are shaking their fists violently at this page, I tend to prefer a nice sublimey interface. 

So, enter kitchen-sink, for all your sink-ing needs.

## Fetching and install

    git clone git@github.com:sabhiram/kitchen-sink.git
    npm update
    mv sample.config.json config.json
    npm start

## Run some tests

    npm test

## Sample Config file

The following settings are referenced from the `config.json` file. 

| Setting | Default | Description |
| ------- | ------- | ----------- |
| port    | 1234    | Override the port for `kitchen-sink` |
| projects| []      | An array of projects we wish to expose files for |

Where an entry in the `projects` array is of the following, note that optional parameters are specified with a `*`:

|    Setting    | Description |
|    -------    | ----------- |
| name          | The name of the project and the key by which it is accessed |
| description   | Description of the project being shared |
| path          | relative, or explicit path to the folder being shared |
| ignore_paths* | list of sub-folder paths to ignore |

*Sample config.json file*
```json
    {
        "port": 2674,
        "projects": [
            {
                "name": "absolute",
                "description": "Absolute path sub-folder",
                "path": "/services_a/project"
            },
            {
                "name": "relative",
                "description": "Relative path sub-folder",
                "path": "../parent/child/project",
                "ignore_paths": ["node-modules", ".git", "log"]
            }
        ]
    }
```

## API

#### GET /

Homepage, will list all projects registered with the server via `config.json`, with clickable links to the `GET /list/<project_name>`

#### GET /list/:project_name

Per-project page with a list of all files in the project, as well as a link to a "bootstrap" file which when run can hit this server to pull all files in said project

#### GET /bootstrap/:project_name

Fetches a `init.sh`-esq file which can be used to fetch all files from the given sub-project to the current directory. You can also pipe this file to a shell like so:

    wget http://<server>:<port>/bootstrap/<project_name> -O - | sh

or the more traditional:

    wget http://<server>:<port>/bootstrap/<project_name> -O bootstrap.sh
    chmod u+x bootstrap.sh
    ./bootstrap.sh

#### GET /get_file/<project_name>/<file/../path>

Fetches a file in a given sub-folder. The headers are setup appropriately that the reciever can only re-update and fetch on file mtime change (last modified time). This is particularly useful in the context of cpp files (for ex), which cause re-compiliation of objects on mtime change (which will always occur if we blindly replace the file). 

Here is how you can go about fetching a file and checking to see if it needs to be pulled down:

    curl http://<server>:<port>/bootstrap/<project_name>/<file/../path> --create-dirs -z <file/../path> -o <file/../path>

## TODOs:

1. Moar tests
2. Does it make sense to have a fetch compressed?
3. The config file needs to be maintainable from the web GUI, and by way of manual edits...
5. There is no default config file, elegantify this whole ordeal
