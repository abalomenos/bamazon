
// Author: Argiris Balomenos
// Date:   March 11, 2019


// npm Modules
require('dotenv').config(); // for MySQL Connection info
var inquirer = require('inquirer');
var mysql = require('mysql');
var colors = require('colors/safe');
var Table = require('cli-table');

// File to process .env for MySQL Connection Info
var keys = require('./keys.js');

// MySQL Database Connection
var connection = mysql.createConnection({
    host: keys.mysql.host,
    port: keys.mysql.port,
    user: keys.mysql.user,
    password: keys.mysql.password,
    database: keys.mysql.database
});

function exit() {

    // Clear the output
    consoleOutput = '';

    // Create the output
    consoleOutput = '';
    consoleOutput += '\n\n';
    consoleOutput += colors.red('******************************************\n');
    consoleOutput += colors.red('*                                        *\n');
    consoleOutput += colors.red('*') + colors.white('   Thank you for working at ') + colors.magenta('b') + colors.grey('Amazon') + colors.white('!    ') + colors.red('*\n');
    consoleOutput += colors.red('*                                        *\n');
    consoleOutput += colors.red('******************************************\n');

    // Display it in the terminal
    console.log(consoleOutput);
    
    // Close MySQL Connection
    connection.end();
    //Exit App
    process.exit();

}

function addNewProduct() {

    function validateCurrency(newProductPrice) {
        var reg = /^-{0,1}\d*\.{0,1}\d+$/;
        return reg.test(newProductPrice) || 'Units should be a dollar amount!';
    }

    function validateNumber(newProductQuantity) {
        var reg = /^\d+$/;
        return reg.test(newProductQuantity) || 'Quantity should be a integer number!';
    }

    inquirer.prompt([
        {
            type: 'input',
            message: 'Product name:',
            name: 'newProductName'
        },
        {
            type: 'input',
            message: 'Product Department:',
            name: 'newProductDepartment'
        },
        {
            type: 'input',
            message: 'Product price:',
            name: 'newProductPrice',
            validate: validateCurrency
        },
        {
            type: 'input',
            message: 'Current quantity:',
            name: 'newProductQuantity',
            validate: validateNumber
        }
    ]).then(function(answers){
        
        // Insert new Product to Database
        connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)', [answers.newProductName, answers.newProductDepartment, answers.newProductPrice, answers.newProductQuantity], function (err, res) {

            // If Query throws an error
            if (err) throw err;

            // Confirm new Product was added
            connection.query('SELECT item_id, product_name, stock_quantity, price FROM products ORDER BY item_id DESC LIMIT 1', function(err, res) {

                // If Query throws an error
                if (err) throw err;

                // Create the Table to Output the Query Result
                var table = new Table({
                    head: [colors.white('ID'), colors.white('Product'), colors.white('Quantity'), colors.white('Price')],
                    colWidths: [10, 50, 10, 15]
                });
        
                for (var i=0; i<res.length; i++) {
                    
                    // Fill our Table with the Products
                    table.push([colors.yellow(res[i].item_id), colors.cyan(res[i].product_name), colors.white(res[i].stock_quantity), colors.green('$') + colors.white(res[i].price)]);
                    
                }
        
                consoleOutput = '';
                consoleOutput += colors.gray('__________________________\n\n');
                consoleOutput += colors.magenta('b') + colors.grey('Amazon') + colors.yellow(' New Product added!\n');
                consoleOutput += table.toString();
                console.log(consoleOutput);
                    
                displayOptions();

            });
        });

    });

}

function addInventory(selectedProduct, selectedUnits) {

    // Get Curernt Stock for Selected Product
    connection.query('SELECT stock_quantity FROM products WHERE item_id=?', [selectedProduct], function(err, res) {

        // If Query throws an error
        if (err) throw err;

        // Update Stock for selected Product
        connection.query('UPDATE products SET stock_quantity =? WHERE item_id=?', [parseInt(res[0].stock_quantity) + parseInt(selectedUnits), selectedProduct], function(err, res) {
        
            // If Query throws an error
            if (err) throw err;
            
            connection.query('SELECT item_id, product_name, stock_quantity, price FROM products WHERE item_id=?', [selectedProduct], function(err, res) {
                
                // If Query throws an error
                if (err) throw err;
        
                // Create the Table to Output the Query Result
                var table = new Table({
                    head: [colors.white('ID'), colors.white('Product'), colors.white('Quantity'), colors.white('Price')],
                    colWidths: [10, 50, 10, 15]
                });
        
                for (var i=0; i<res.length; i++) {
                    
                    // Fill our Table with the Products
                    table.push([colors.yellow(res[i].item_id), colors.cyan(res[i].product_name), colors.white(res[i].stock_quantity), colors.green('$') + colors.white(res[i].price)]);
                    
                }
        
                consoleOutput = '';
                consoleOutput += colors.gray('__________________________\n\n');
                consoleOutput += colors.magenta('b') + colors.grey('Amazon') + colors.yellow(' Product updated!\n');
                consoleOutput += table.toString();
                console.log(consoleOutput);
                       
                displayOptions();
                    
            });          
            
        });
    });

}

function addToInventory(productList) {

    function validateNumber(currentUnits) {
        var reg = /^\d+$/;
        return reg.test(currentUnits) || 'Units should be a number!';
    }

    inquirer.prompt([
        {
            type: 'list',
            message: 'For which product would you like to add additional inventory?',
            choices: productList.toString().split(','),
            name: 'selectedProduct'
        },
        {
            type: 'input',
            message: 'How many additional units?',
            name: 'currentUnits',
            validate: validateNumber
        }
    ]).then(function(answers){

        // Getting id from Selection
        var selectedProduct = answers.selectedProduct.toString().split(' ')[0].trim();
        
        var selectedUnits = answers.currentUnits;

        addInventory(selectedProduct, selectedUnits);

    });

}

function viewLowInventory() {

    // Get List of Products
    connection.query('SELECT item_id, product_name, stock_quantity, price FROM products WHERE stock_quantity <= 5', function(err, res) {
        if (err) throw err;

        if (res.length == 0) {

            consoleOutput = '';
            consoleOutput = '\n\n';
            consoleOutput += colors.white('All inventory in good stock quantities!\n\n');
            console.log(consoleOutput);

        } else {
            // Create the Table to Output the Query Result
            var table = new Table({
                head: [colors.white('ID'), colors.white('Product'), colors.white('Quantity'), colors.white('Price')],
                colWidths: [10, 50, 10, 15]
            });

            for (var i=0; i<res.length; i++) {
                
                // Fill our Table with the Products
                table.push([colors.yellow(res[i].item_id), colors.cyan(res[i].product_name), colors.white(res[i].stock_quantity), colors.green('$') + colors.white(res[i].price)]);
                
            }

            consoleOutput = '';
            consoleOutput = '\n';
            consoleOutput += colors.gray('__________________________\n\n');
            consoleOutput += colors.magenta('b') + colors.grey('Amazon') + colors.yellow(' Low Inventory\n');
            consoleOutput += table.toString();
            console.log(consoleOutput);
        }
        
        displayOptions();

    });
}

function viewProducts(flag) {

    // Get List of Products
    connection.query('SELECT item_id, product_name, stock_quantity, price FROM products', function(err, res) {
        if (err) throw err;

        // Create the Table to Output the Query Result
        var table = new Table({
            head: [colors.white('ID'), colors.white('Product'), colors.white('Quantity'), colors.white('Price')],
            colWidths: [10, 50, 10, 15]
        });


        // Initialize Array to store Products, will be used for inquirer in addToInventory()
        var productList = [];

        for (var i=0; i<res.length; i++) {
            
            // Fill our Table with the Products
            table.push([colors.yellow(res[i].item_id), colors.cyan(res[i].product_name), colors.white(res[i].stock_quantity), colors.green('$') + colors.white(res[i].price)]);

            // Fill productList with ID and Name
            productList.push(res[i].item_id + ' ' + res[i].product_name);
            
        }

        consoleOutput = '';
        consoleOutput = '\n';
        consoleOutput += colors.gray('__________________________\n\n');
        consoleOutput += colors.magenta('b') + colors.grey('Amazon') + colors.yellow(' Products for Sale\n');
        consoleOutput += table.toString();
        console.log(consoleOutput);
        
        if (flag) {
            displayOptions();
        } else {
            addToInventory(productList);
        }

    });

}

function adminAction (selection) {

    // Switch statement based on Manager's selection
    switch (selection) {
        case 'View Products for Sale':
            viewProducts(true);
            break;
        case 'View Low Inventory':
            viewLowInventory();
            break;
        case 'Add to Inventory':
            viewProducts(false);
            break;
        case 'Add New Product':
            addNewProduct();
            break;
        case 'Exit':
            exit();
            break;
    }
}

function displayOptions() {

    inquirer.prompt([
        {
            type: 'list',
            message: 'Select Admin Action',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
            name: 'selectedAction'
        }
    ]).then(function(answers){

        adminAction(answers.selectedAction);

    });
}

function initialize() {

    // Clear console
    console.log('\033c');
    
    // Clear the output
    consoleOutput = '';
    
    // Create the output
    consoleOutput += colors.red('******************************************\n');
    consoleOutput += colors.red('*                                        *\n');
    consoleOutput += colors.red('*') + colors.white('    Welcome to ') + colors.magenta('b') + colors.grey('Amazon') + colors.white(' Manager View!    ') + colors.red('*\n');
    consoleOutput += colors.red('*                                        *\n');
    consoleOutput += colors.red('*') + colors.yellow('      Author') + colors.green('  :  ') + colors.white('Argiris Balomenos      ') + colors.red('*\n');
    consoleOutput += colors.red('*') + colors.yellow('      Date') + colors.green('    :  ') + colors.white('March 11, 2019         ') + colors.red('*\n');
    consoleOutput += colors.red('*                                        *\n');
    consoleOutput += colors.red('******************************************\n\n');
    console.log(consoleOutput);

    // Start the App
    displayOptions();

}


// Everything starts here
initialize();