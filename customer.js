// @author: Derek Cutler
// @github: DerekCutler
// @comment: Homework 10 - Bamazon SQL and Node app



// Require prompt node package 
var prompt = require('prompt');

// Require mySQL node package
var mysql = require('mysql');

// Require my homegrown table padding function
var padText = require('./padTable.js')


// Link to mySQL Database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "Password", 
    database: "bamazon"
});

// Connect to Database
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});



// Display All Items inside Database and sell an item to customer
connection.query('SELECT * FROM Products', function (err, res) {

    // Error Handler
    if (err) throw err;


    // Show User message
    console.log('What do we have here...\n');

    // Set up table header
    console.log(' ID | Product Name | Department Name | Price | In Stock');
    console.log('==========================================')

    // Loop through database and show all items
    for (var i = 0; i < res.length; i++) {

        // ---------- Add in padding for table ----------
        var item_id = res[i].item_id + ''; // convert to string
        item_id = padText("  ID  ", item_id);

        var product_name = res[i].product_name + ''; // convert to string
        product_name = padText("      Product Name      ", product_name);

        var department_name = res[i].department_name + ''; // convert to string
        department_name = padText("  Department Name  ", department_name);

        var price = '$' + res[i].Price.toFixed(2) + ''; // convert to string
        price = padText("   Price  ", price);

        var stock_quantity = res[i].stock_quantity + ''; // convert to string (no need to pad)
        // ----------------------------------------------

        // Log table entry
        console.log(item_id + '|' + product_name + '|' + department_name + '|' + price + '|    ' + stock_quantity);
    }

    // =================================================================================================

    // After the table is shown, ask the user to buy something
    prompt.start();

    // Ask for Item ID
    console.log('\nWhat do you want to buy?');
    prompt.get(['buy_item_id'], function (err, result) {

        // Show Item ID selected
        var buy_item_id = result.buy_item_id;
        console.log('You selected Item # ' + buy_item_id + '.');

        // Then ask for Quanity (once user completed first entry)
        console.log('\nHow many do you wish to buy?')
        prompt.get(['buyItemQuantity'], function (err, result) {

            // Show quantity selected
            var buyItemQuantity = result.buyItemQuantity;
            console.log('You selected to buy ' + buyItemQuantity + ' of these.');

            // Once the customer has placed the order, check if store has enough of the product to meet the request
            connection.query('SELECT stock_quantity FROM Products WHERE ?', [{ item_id: buy_item_id }], function (err, res) {
                if (err) throw err; // Error Handler
                // Check if the item Id was valid (i.e. something was returned from mySQL)
                if (res[0] == undefined) {
                    console.log('I am sorry Dave, I cannot allow you to do that... We found no items with Item ID "' + buy_item_id + '"');
                    connection.end(); // end the script/connection
                }
                // Valid Item ID, so compare Bamazon Inventory with user quantity 
                else {
                    var bamazonQuantity = res[0].stock_quantity;
                    // Sufficient inventory
                    if (bamazonQuantity >= buyItemQuantity) {

                        // Update mySQL database with reduced inventory
                        var newInventory = parseInt(bamazonQuantity) - parseInt(buyItemQuantity); // ensure we have integers for subtraction & database
                        connection.query('UPDATE Products SET ? WHERE ?', [{ stock_quantity: newInventory }, { item_id: buy_item_id }], function (err, res) {
                            if (err) throw err; // Error Handler
                        }); // end inventory update query


                        // Show customer their purchase total (need to query the price info from database)
                        var customerTotal;
                        connection.query('SELECT Price FROM Products WHERE ?', [{ item_id: buy_item_id }], function (err, res) {

                            var buyItemPrice = res[0].Price;
                            customerTotal = buyItemQuantity * buyItemPrice.toFixed(2);

                            console.log('\nYour total is $' + customerTotal + '.');

                            // ------------------------- Re factor for Executive Challenge ------------------------
                            // Find the department for the purchase item
                            connection.query('SELECT department_name FROM Products WHERE ?', [{ item_id: buy_item_id }], function (err, res) {
                                var itemDepartment = res[0].department_name;

                                // Find the current Revenue for that department
                                connection.query('SELECT TotalSales FROM Departments WHERE ?', [{ department_name: itemDepartment }], function (err, res) {
                                    var totalSales = res[0].TotalSales;

                                    // Calculate new sale revenue
                                    var totalSales = parseFloat(totalSales) + parseFloat(customerTotal);

                                    // Add the revenue from each transaction to the TotalSales column for the related department.
                                    connection.query('UPDATE Departments SET ? WHERE ?', [{ TotalSales: totalSales }, { department_name: itemDepartment }], function (err, res) {
                                        if (err) throw err; // Error Handler
                                        console.log('Transaction Completed. Thank you!')
                                        connection.end(); // end the script/connection

                                    }); // end new revenue update query

                                }); // end current revenue query

                            }); // end department name query 
                            // -------------------------------------------------------------------------------------
                        }); // end customer purchase update query 
                    }
                    // Insufficient inventory
                    else {
                        console.log('Sorry... We only have ' + bamazonQuantity + ' of those items. Order cancelled.');
                        connection.end(); // end the script/connection
                    }
                }

            }); // end item quantity query

        }); // end of prompt 2

    }); // end of prompt 1