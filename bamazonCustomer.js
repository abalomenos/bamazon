
// Author: Argiris Balomenos
// Date:   March 11, 2019


// npm Modules
require("dotenv").config(); // for MySQL Connection info
var inquirer = require('inquirer');
var mysql = require('mysql');

var keys = require('./keys.js');

var connection = mysql.createConnection({
    host: keys.mysql.host,
    port: keys.mysql.port,
    user: keys.mysql.user,
    password: keys.mysql.password,
    database: keys.mysql.database
});



// Everything starts here
initialize();