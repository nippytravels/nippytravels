CREATE TABLE `forms` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text,
	`last_name` text,
	`middle_name` text,
	`date_of_birth` text,
	`passport_number` text,
	`passport_issue_date` text,
	`passport_expiry` text,
	`marital_status` text,
	`phone_number` text,
	`email` text,
	`spouse_name` text,
	`spouse_date_of_birth` text,
	`mother_full_name` text,
	`father_full_name` text,
	`father_date_of_birth` text,
	`mother_date_of_birth` text,
	`employer_name` text,
	`employer_address` text,
	`employer_email_address` text,
	`previously_refused` integer DEFAULT false,
	`previously_issued` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forms_passport_number_unique` ON `forms` (`passport_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `forms_passport_issue_date_unique` ON `forms` (`passport_issue_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `forms_phone_number_unique` ON `forms` (`phone_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `forms_email_unique` ON `forms` (`email`);--> statement-breakpoint
CREATE INDEX `email_index` ON `forms` (`email`);