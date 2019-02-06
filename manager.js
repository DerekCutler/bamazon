// Level 2 requirements
var mysql = require('mysql');
var inquirer = require('inquirer');
// var keys = require('./keys.js');


// create the connection information for the bamazon database
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "Password",
    database: "Bamazon"
  });

// connect to mySQL database
connection.connect(function(err) {
    if (err) throw err;
    // run start prompt
    // `_res` is an unused param
    startPrompt().then(function(_res) {
        // once finished destroy connection
        connection.destroy();
    }).catch(function(err) {
        console.log(err);
    });
});

function startPrompt() {
    return inquirer.prompt([{
        name: 'command',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View Products for Sale', 'View Low Inventory', 'Add to Inventory',
            'Add New Product'
        ]
    }]).then(function(answer) {
        // switch based on command chosen
        switch (answer.command) {
            case 'View Products for Sale':
                // print all products
                return viewProducts().then(function(result) {
                    return printItems(result);
                }).catch(function(err) {
                    console.log(err);
                    return;
                });
            case 'View Low Inventory':
                // print products with less than 5
                return viewLowInventory().then(function(result) {
                    return printItems(result);
                }).catch(function(err) {
                    console.log(err);
                    return;
                });
            case 'Add to Inventory':
                // add inventory
                return addInventory().then(function() {
                    console.log('Successfully added items');
                    return;
                }).catch(function(err) {
                    console.log(err);
                    return;
                });
            case 'Add New Product':
                // add a new product
                return addProduct().then(function() {
                    console.log('Successfully added products');
                    return;
                }).catch(function(err) {
                    console.log(err);
                    return;
                });
            default:
                console.log('what?');
        }
    });
}

function viewProducts() {
    // query for getting all items in products
    return runQuery("SELECT * FROM products");
}

function viewLowInventory() {
    // query for products with a quantity less than 5
    return runQuery("SELECT * FROM products WHERE stock_quantity < 5");
}

function addInventory() {
    // query for all products and ask which the user would like to add to
    return runQuery("SELECT * FROM products").then(function(result) {
        return inquirer.prompt([{
            name: 'product_id',
            message: 'Choose what product you would like to add to.',
            type: 'list',
            choices: result.map(function(item) {
                var object = {};
                object.name = item.product_name;
                object.value = item.item_id;
                return object;
            })
        }, {
            name: 'quantity',
            message: 'How much of this item would you like to add?',
            type: 'input',
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                } else {
                    console.log('\nPlease enter a valid quantity.');
                    return false;
                }
            }
        }]).then(function(answer) {
            // query for chosen product
            return runQuery("SELECT * FROM products WHERE item_id=?", answer.product_id).then(function(result) {
                var newQuantity = parseInt(result[0].stock_quantity) + parseInt(answer.quantity);
                var product = answer.product_id;
                // query to update stock quantity with new quantity
                return runQuery("UPDATE products SET stock_quantity=? WHERE item_id=?", [newQuantity, product]);
            }).catch(function(err) {
                console.log(err);
            });
        });
    });
}

function addProduct() {
    // ask for all the info to add a product
    return inquirer.prompt([{
        name: 'item_id',
        message: 'What is the ID of the product?',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid ID.');
                return false;
            }
        }
    }, {
        name: 'product_name',
        message: 'What is the name of the product?',
        type: 'input'
    }, {
        name: 'department_name',
        message: 'What is the name of the department?',
        type: 'input'
    }, {
        name: 'price',
        message: 'What is the price?',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid price.');
                return false;
            }
        }
    }, {
        name: 'stock_quantity',
        message: 'What is the quantity?',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
    }]).then(function(answer) {
        answer.product_sales = 0;
        return runQuery("INSERT INTO products SET ?", answer);
    });
}

// generic print function to DRY things up
function printItems(items) {
    items.forEach(function(item) {
        console.log('Item ID: ' + item.item_id + ' | Product Name: ' + item.product_name + ' | Price: ' + item.price + ' | Quantity: ' + item.stock_quantity);
    });
}

// generic query function to DRY things up
function runQuery(query, values) {
    return new Promise(function(resolve, reject) {
        connection.query(query, values, function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    });
};