
Step 1:
    a. Open Root Folder of the Projet ( API ) in VS Code
    b. Setup the folder structure as shown below by running the commands shown in paranthesis for each line

        Backend
        |───bin             (md bin)
        ├───config          (md src/config)
        ├───log             (md src/log)
        └───src             (md src)
            ├───models      (md src/models)
            ├───controllers (md src/controllers)
            ├───middleware  (md src/middleware)
            ├───routes      (md src/routes)
            └───utils       (md src/utils)

    c. initialize the NPM project by running (npm init) command and provide appropriate answers
        i.    "package name" - all lower case, include hyphens, enter readable name of the project (web-api)
        ii.   "license" - UNLICENSED

    d. open package.json file (`code package.json`) and update/ add below fields
        i.    "author": {"name":"Your full name", "email":"your official email", "url":"https://www.thulisha.in"}
        ii.   "contrbutors": ["add any contributors full names", ""]
        iii.  "description" - update as needed
        iv.   "keywords" - ["thulisha", "blog web", ...]
        v.    "main" : "server.js"
        vi.   "scripts": {..., "start": "nodemon server.js"  }

Step 2: (OPTIONAL)
    a. Get SSL certificates (script to generate self signed certificates using openssl command)  (https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/)
        ../openssl/bin/openssl genrsa -out key.pem
        ../openssl/bin/openssl req -new -key key.pem -out csr.pem
        ../openssl/bin/openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
        rm csr.pem

Step 3:
    a. install dependencies
        EXPRESS (npm install express)
        NODEMON (npm install nodemon)

Step 4:

    a. create a file named "server.js" in root folder (code server.js) 
    b. enter below code and save
        const express = require('express');
        const app = express();
        
        app.get('/', function (req, res) {
        res.send('Hello World');
        });
        
        app.listen(3000);
    c. run the server (npm run start) 
    d. open browser and enter http://localhost:3000

Step 5:

    a. add below code to server.js before https.createSerer call. these would set up default GET routes for root urls.

        app.use ("/", function (req, res) { res.send("Hellow World");});
        app.use ("/api", function (req, res) { res.send("Welcome to API");});

    b. create a new file named "http_codes.json" in src/utils folder (code src/utils/http_codes.json) and enter below data, save it.
        {
            "OK": 200,
            "CREATED": 201,
            "ACCEPTED": 202,
            "NO_CONTENT": 204,
            "RESET_CONTENT": 205,
            "PARTIAL_CONTENT": 206,
            "NOT_MODIFIED": 304,
            "BAD_REQUEST": 400,
            "UNAUTHORIZED": 401,
            "FORBIDDEN": 403,
            "NOT_FOUND": 404,
            "METHOD_NOT_ALLOWED": 405,
            "ENTITY_TOO_LARGE": 413,
            "URI_TOO_LONG": 414,
            "UNSUPPORTED_MEDIA_TYPE": 415,
            "INTERNAL_SERVER_ERROR": 500,
            "NOT_IMPLEMENTED": 501,
            "SERVICE_UNAVAILABLE": 503
        }

--====================================================================================================
Step 6: setup dotenv
    a. install dotenv (npm install dotenv)
    b. add below code at the top of server.js   
        require("dotenv").config({ path: __dirname + "/global.env" });
    c. create a file named global.env in root directory of repo and add any environment variables you needed  
        DB_HOST=localhost
        DB_USER=
        DB_PASS=
        NODE_ENV=development
    d. make a copy of the global.env file as .env.sample and remove all values, leaving just the vairable names in it.
    e. add global.env to .gitignore and do not checkin
    f. checkin .env.example file into source control
--====================================================================================================

Step 7: setup Sonar Lint
    a. enable jshint extension
    c. after this, check PROBLEMS tab in terminal and resolve any issues reported by JSHint
--====================================================================================================

Step 8: setup ESLint
    a. npm i eslint -g
    b. eslint -init 
    c. if required update ecmaversion to 2021 in .eslintrc.json file 
--====================================================================================================

Step 9: setup morgan and configure to write logs to a file (apirequests.log)
    a. npm i morgan
    b. follow npmjs guide

--====================================================================================================

Step 10: setup winston logger
    a. npm i winston
    b. follow guide

--====================================================================================================
Step 11: setup CORS
    a. 
--====================================================================================================
Step 12: setup helmet
    a. npm install helmet

--====================================================================================================
Step 13: setup sequelize
    a. npm install sequelize mssql

--====================================================================================================

--====================================================================================================
Next steps:
--====================================================================================================


Step 21: create middleware functions for auth 
    a. install a package to implement google auth (npm install google-auth-library)
    b. create a file named auth.js in src/middleware (code src/middleware/auth.js)

--=======================================================================================================
Step 22: <TBD>
    a. create models/ controllers - user, userSession
    b. create routes - login/userSession 
    c. add login and user routes to server.js 
--

Step 23: <TBD>
    a. setup test framework
    b. write unit tests for entities and routes created in step 7.
    c. test the app, check coverage

Step 24: <TBD> OpenAPI documentation

Step 25: <TBD> implement functions to support health check and scripts to read logger output
--=======================================================================================================

