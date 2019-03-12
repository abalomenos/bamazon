DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
  VALUES  ('Pen', 'Office Supplies', 1.50, 75),
          ('Canon Printer', 'Office Supplies', 349.99, 10),
          ('HP Spectre Laptop', 'Computers', 999.99, 20),
          ('LG 45" TV', 'Electronics', 499.99, 30),
          ('XBox One S', 'Gaming', 249.99, 25),
          ('PlayStation 4', 'Gaming', 399.99, 20),
          ('Galaxy S10 Screen Protector', 'Cell Phone Accessories', 12.99, 45),
          ('Pixel 2 Screen Protector', 'Cell Phone Accessories', 9.99, 25),
          ('HP Spectre Case', 'Computer Accessories', 15.99, 35),
          ('Surface Pro Case', 'Computer Accessories', 19.99, 55)

