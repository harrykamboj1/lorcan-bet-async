# Inventory and Order Management System

## Overview
This project is an Inventory and Order Management System built with Node.js, Express, Prisma, PostgreSQL, and Redis. It provides functionalities for managing products, inventory, and orders, with support for asynchronous payment processing and product categorization.

## Table of Contents
- [File Structure](#file-structure)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Database Migration](#database-migration)
- [Simulating Async Payment Service](#simulating-async-payment-service)
- [Testing the Application](#testing-the-application)
- [Design Choices](#design-choices)
- [License](#license)

## File Structure
Task Title: Inventory and Order Management System with Asynchronous Processing and Distributed Consistency

You are tasked with building an inventory and order management system using PostgreSQL as the main database. This system should be designed to handle asynchronous processing, concurrency, and incremental database changes. Additionally, the system will have to deal with common problems found in distributed systems, such as failures, retries, and eventual consistency.

### Features:

1. **Product Management**: Create, update, and delete products.
2. **Inventory Management**: Manage product inventory levels and handle concurrent inventory updates.
3. **Order Processing**: Handle and process incoming orders asynchronously.
4. **Distributed Consistency**: Ensure eventual consistency across systems when processing orders asynchronously.
5. **Database Migration**: Safely introduce product categories without downtime or breaking changes.
6. **Resiliency in Async Systems**: Handle failures and retry mechanisms in the order processing system.

Explain me whole the above stuff like a beginner

Now i am going to use nodejs and posgres sql as a database and use docker to setup postgres and use prisma as orm 

### 1. **Database Schema**:

Design a PostgreSQL schema with the following tables:

- **Products**: Stores product information (id, name, description, price).
- **Inventory**: Tracks product inventory (id, product_id, quantity).
- **Orders**: Manages customer orders (id, product_id, quantity, status: pending/processed/failed).
- **Order_Logs**: Logs each order's processing status (id, order_id, status, processed_at, error_message).

can we use nodemon here

I want to seperate prisma client as it does not generate multiple times resutling in an exception 

Now we have to cover all these points

### 2. **Asynchronous Order Processing**:

- Implement asynchronous processing of orders where:
    - The system checks if the ordered product has enough stock available.
    - If stock is available, it deducts the ordered quantity from the inventory.
    - If stock is insufficient, the order should fail, but the system should retry the order after a delay.
    - Ensure that each order is processed only once (idempotent operations) even in the case of system failures (e.g., process crash, retries).
    - Log the result of the processing (successful or failed) in the `Order_Logs` table, including error details for failed orders.
- **Concurrency Handling**:
    - Multiple orders may be processed at the same time, so ensure that two processes updating the same product’s inventory don’t cause race conditions. Implement locking, row versioning, or other mechanisms to ensure data integrity.
- **Order Retry Mechanism**:
    - Implement a retry mechanism for failed orders (e.g., when there’s not enough inventory). The system should retry the failed orders after a delay (e.g., exponential backoff).

also use cors and middleware 

i don't want to use morgan i want to use simple middleware given by express

For redis_url need to setup docker for redis and have to pass url in env file

should i have to use it in every ts file or in just main index.ts file

can you give me structure to how to arrange all files 

can you generate the whole code along with path of the file and how you structured and arrange it 

why you pass only orderId and status in orderLogs

must have a duplicate check to prevent duplicate new product

can we send response like product created succesfully and anything like that

Do we create and delete inventory 

we have to perform all crud operations 

can we use bodyparsor

Now moving ahead with 3 point

Simulate an external payment service that processes payments for each order asynchronously. The service may be delayed, fail, or succeed.

- **Payment Handling**:
    - Each order should be processed in two phases:
        1. **Reserve Inventory**: Check and reserve the inventory for the order.
        2. **Process Payment**: After reserving inventory, call an external payment service asynchronously.
    - After reserving the inventory, the payment service can either succeed or fail. If the payment fails, the system should release the reserved inventory. Ensure eventual consistency across inventory and payment.
- **Failure Scenarios**:
    - Simulate scenarios where the payment service fails or becomes unavailable (e.g., random failures, timeout errors).
    - Implement logic to handle these failures, including retry mechanisms, compensating actions (e.g., releasing inventory), and eventual consistency guarantees.



To implement the payment handling and inventory reservation as described, we can create a simulated external payment service and integrate it into the order processing workflow. Below is a step-by-step approach to achieve this:
Step 1: Simulate the External Payment Service
We'll create a simple function that simulates the behavior of an external payment service. This function will randomly succeed or fail, simulating network issues or payment failures.
paymentService.ts
Step 2: Update the Order Processing Logic
We'll modify the processOrder function in orderService.ts to include the inventory reservation and payment processing steps.
orderService.ts
Step 3: Update the Order Routes
Make sure your order routes are set up to handle the new order processing logic. The existing routes should work without changes, but ensure you handle errors appropriately.
Summary of Changes
Simulated Payment Service: A new service simulates payment processing with random success and failure.
Order Processing Logic:
Reserve Inventory: Check and reserve inventory for the order.
Process Payment: Call the payment service after reserving inventory.
Failure Handling: If payment fails, release the reserved inventory and log the failure.
Success Handling: If payment succeeds, update the order status and log the success.
Failure Scenarios
The payment service randomly fails 30% of the time, simulating real-world scenarios where payments may not go through.
If the payment fails, the system compensates by restoring the reserved inventory, ensuring eventual consistency.
This setup provides a robust framework for handling orders with asynchronous payment processing, including failure scenarios and compensating actions.
Each order item has product which has some amount , should we deduct that amount of the product

Yes, you should deduct the total amount based on the price of each product when processing the order. Instead of using a fixed price (like 10 in the previous example), you should retrieve the price of each product from the database and calculate the total amount accordingly.
Here's how you can modify the processOrder function to deduct the correct amount based on the product price:
Updated processOrder Function
orderService.ts
Key Changes:
Include Product Details: When fetching the order, we include the product details in the orderItems to access the price.
Calculate Total Amount: The total amount is calculated based on the price of each product multiplied by the quantity ordered.
Dynamic Pricing: Instead of using a fixed price, the price is retrieved from the database for each product.
This ensures that the payment processing reflects the actual cost of the products being ordered, providing a more accurate and realistic order processing flow.
Now 4th part is to be done 

The business team has decided to introduce a new feature to categorize products. Categories should be flexible, allowing products to belong to multiple categories.

- Without breaking the current schema, perform a database migration to introduce this feature.
- Write a migration that:
    - Creates a **Categories** table (id, name).
    - Creates a **Product_Categories** table (product_id, category_id).
    - Preserves the existing product-related functionality.

Describe your migration strategy and ensure that the system continues to operate without downtime during this migration.

To introduce the new feature of categorizing products without breaking the current schema, we will follow a careful migration strategy. This will involve creating new tables for categories and a join table for the many-to-many relationship between products and categories. Here’s how we can achieve this:
Migration Strategy
Create the Categories Table: This table will store the category information, including an ID and a name.
Create the Product_Categories Table: This join table will link products to categories, allowing a product to belong to multiple categories.
Ensure Existing Functionality: The migration will not alter existing product-related functionality. We will ensure that the current product operations remain intact.
Zero Downtime Migration: We will perform the migration in a way that does not disrupt the existing application. This can be achieved by:
Creating new tables without modifying existing ones.
Using a rolling deployment strategy if necessary, where the application can continue to serve requests while the migration is being applied.
Step-by-Step Migration
Update the Prisma Schema: Modify the schema.prisma file to include the new tables.
schema.prisma
Create a Migration: Run the Prisma migration command to create the migration files.
Bash
Apply the Migration: This command will generate the SQL migration file and apply it to the database. The generated SQL will look something like this:
Preserve Existing Functionality: Ensure that the existing product-related functionality remains intact. The new tables do not interfere with the existing Product table or its operations.
Testing: After applying the migration, thoroughly test the application to ensure that:
Existing product functionality works as expected.
The new categories can be created and associated with products without issues.
Example of Using the New Feature
After the migration, you can create categories and associate them with products. Here’s an example of how you might implement this in your service:
Conclusion
By following this migration strategy, we can introduce the new product categorization feature without disrupting existing functionality. The migration is designed to be non-intrusive, ensuring that the application continues to operate smoothly during the process. After the migration, you can start using the new categories and product associations in your application.
Based on the above whole changes and on the basis of project 
what should i reply this 

### Deliverables:

1. **Code**:
    - The full implementation, including SQL migrations and async logic.
    - Use the programming language and tooling of your choice.
    - Clear documentation for setting up and running the project.
2. **Explanation**:
    - An explanation of the design choices, particularly around concurrency and distributed consistency.
    - A description of the migration strategy and how breaking changes were avoided.
3. **README**:
    - Setup instructions, including how to run the app, migrate the database, and simulate the async payment service and inventory syncing.

Here's a structured response you can use to address the deliverables based on the project changes and implementation:
---
Deliverables Response
1. Code
The full implementation of the Inventory and Order Management System is complete. The code includes:
Product Management: CRUD operations for products, including duplicate checks and category associations.
Inventory Management: Functions to create, update, and delete inventory, with checks for sufficient stock.
Order Processing: Asynchronous order processing with inventory reservation and payment handling.
Categories: A new feature allowing products to belong to multiple categories, implemented with a many-to-many relationship.
SQL Migrations: All necessary migrations have been created using Prisma to introduce the new categories feature without breaking existing functionality.
The project is built using Node.js with Express for the server, Prisma as the ORM, and PostgreSQL for the database. Redis is used for managing the job queue with Bull.
2. Explanation
Design Choices:
Concurrency Handling: The system uses transactions to ensure that inventory updates are atomic, preventing race conditions when multiple orders are processed simultaneously. This guarantees that inventory levels remain consistent even under concurrent access.
Distributed Consistency: The asynchronous processing of orders ensures that the system can handle failures gracefully. If a payment fails, the reserved inventory is released, maintaining eventual consistency across the system.
Migration Strategy:
The migration to introduce product categories was designed to be non-intrusive. New tables (Categories and Product_Categories) were created without altering existing tables or functionality.
The migration was executed using Prisma's migration tools, ensuring that the application could continue to operate without downtime during the process. Existing product-related functionality was preserved, allowing for seamless integration of the new feature.
3. README
The project includes a comprehensive README file with the following setup instructions:
Installation: Instructions for cloning the repository and installing dependencies using npm.
Running the Application: Steps to start the server, including setting up environment variables for the database and Redis.
Database Migration: Commands to run the Prisma migrations to set up the database schema, including the new categories feature.
Simulating the Async Payment Service: Instructions on how to test the payment processing, including the behavior of the simulated payment service and how to handle failures.
Testing the Application: Guidelines for testing the CRUD operations for products, inventory management, and order processing.
---
Feel free to adjust any specific details or add any additional information that may be relevant to your project or the audience you are addressing.
Generate a github readme file with all file structure and all the above points

Here's a comprehensive README.md file for your GitHub repository, including the project structure and all the necessary points discussed:
inventory-order-system/
│
├── src/
│ ├── config/
│ │ └── env.ts
│ ├── db/
│ │ └── db.ts
│ ├── queues/
│ │ └── orderQueue.ts
│ ├── services/
│ │ ├── categoryService.ts
│ │ ├── inventoryService.ts
│ │ ├── orderService.ts
│ │ └── productService.ts
│ ├── routes/
│ │ ├── categoryRoutes.ts
│ │ ├── inventoryRoutes.ts
│ │ ├── orderRoutes.ts
│ │ └── productRoutes.ts
│ ├── middleware/
│ │ ├── errorHandler.ts
│ │ └── requestLogger.ts
│ └── index.ts
├── prisma/
│ └── schema.prisma
├── .env
├── .gitignore
├── docker-compose.yml
├── package.json
└── tsconfig.json



## Features
- **Product Management**: Create, read, update, and delete products with duplicate checks.
- **Inventory Management**: Manage inventory levels with create, update, and delete operations.
- **Order Processing**: Asynchronous order processing with inventory reservation and payment handling.
- **Product Categorization**: Flexible categorization allowing products to belong to multiple categories.
- **Logging and Error Handling**: Middleware for logging requests and handling errors gracefully.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/inventory-order-system.git
   cd inventory-order-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db?schema=public"
   REDIS_URL="redis://localhost:6379"
   PORT=3000
   ```

4. **Run Docker Containers**:
   Use Docker Compose to start PostgreSQL and Redis:
   ```bash
   docker-compose up -d
   ```

5. **Run Database Migrations**:
   Apply the Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the Application**:
   ```bash
   npm run dev
   ```

## Database Migration
The migration to introduce product categories was performed using Prisma. The following tables were created:
- **Categories**: Stores category information (id, name).
- **Product_Categories**: Join table linking products to categories.

The migration was designed to be non-intrusive, ensuring that existing functionality remained intact.

## Simulating Async Payment Service
The payment service simulates asynchronous payment processing with random success and failure. You can test the payment processing by creating orders and observing the behavior of the payment service.

## Testing the Application
You can test the following functionalities:
- **CRUD Operations for Products**: Create, read, update, and delete products.
- **Inventory Management**: Create and update inventory levels.
- **Order Processing**: Create orders and observe the payment processing flow.

## Design Choices
- **Concurrency Handling**: Transactions are used to ensure atomic updates to inventory, preventing race conditions.
- **Distributed Consistency**: The system handles payment failures gracefully by releasing reserved inventory, ensuring eventual consistency.

## License
This project is licensed under the MIT License. See the LICENSE file for details.