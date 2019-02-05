-- @author: Derek Cutler --
-- @github: DerekCutler --
-- @comment: Homework 1O - Bamazon SQL and Node app

-- Drops the bamazon if it exists currently --
DROP DATABASE IF EXISTS bamazon;

-- Creates the "bamazon" database --
CREATE DATABASE bamazon;

-- Makes it so all of the following code will affect bamazon --
USE bamazon;


-- ======= Products Table ======= --
-- Creates the table "products" within bamazon --
CREATE TABLE products
(
  -- Column: item_id --
  item_id INTEGER NOT NULL
  AUTO_INCREMENT PRIMARY KEY, 

  -- Column: product_name --
  product_name VARCHAR
  (42),

  -- Column: department_name --
  department_name VARCHAR
  (42),

  -- Column: price --
  price DOUBLE
  (10,2),

   -- Column: stock_quantity --
stock_quantity INTEGER
);

  -- Seed Items into Database
  INSERT INTO Products
    (product_name, department_name, price, stock_quantity)
  VALUES
    ("Beer", "Grocery", 13.99, 12),
    ("Yogurt", "Dairy", 3.99, 24),
    ("PS4", "Electronics", 399.99, 5),
    ("Xbox One", "Electronics", 379.99, 7),
    ("iPad", "Electronics", 499.99, 18),
    ("Yoga Mat", "Sporting Goods", 39.99, 2),
    ("Helmet", "Sporting Goods", 119.99, 49),
    ("Desert Solitaire", "Books", 13.99, 69),
    ("Game of Thrones", "Books", 29.99, 33),
    ("Fight Club", "Books", 11.99, 6),
    ("Star Wars", "Movies", 21.99, 36),
    ("Beer Fest", "Movies", 13.99, 21),
    ("Led Zeppelin IV", "Music", 13.99, 42);

  -- ======= Products Table ======= --
