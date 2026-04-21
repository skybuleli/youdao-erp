CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`sort_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `inventory_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`warehouse_id` integer,
	`type` text NOT NULL,
	`qty` real NOT NULL,
	`before_qty` real,
	`after_qty` real,
	`ref_type` text,
	`ref_id` integer,
	`created_by` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`qty` real NOT NULL,
	`unit_price` real NOT NULL,
	`amount` real NOT NULL,
	`remark` text
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_no` text NOT NULL,
	`type` text NOT NULL,
	`sub_type` text,
	`partner_id` integer NOT NULL,
	`warehouse_id` integer,
	`total_amount` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`payable_amount` real DEFAULT 0,
	`paid_amount` real DEFAULT 0,
	`status` text DEFAULT 'pending',
	`order_date` integer,
	`remark` text,
	`created_by` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_no_unique` ON `orders` (`order_no`);--> statement-breakpoint
CREATE TABLE `partners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`contact` text,
	`phone` text,
	`address` text,
	`balance` real DEFAULT 0,
	`remark` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`barcode` text,
	`name` text NOT NULL,
	`category_id` integer,
	`specs` text,
	`unit` text NOT NULL,
	`purchase_price` real DEFAULT 0,
	`sale_price` real DEFAULT 0,
	`stock_qty` real DEFAULT 0,
	`min_stock` real DEFAULT 0,
	`max_stock` real DEFAULT 999999,
	`image_url` text,
	`status` integer DEFAULT 1,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_unique` ON `products` (`barcode`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`partner_id` integer,
	`order_id` integer,
	`account` text,
	`remark` text,
	`created_by` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`phone` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`manager_id` integer
);
