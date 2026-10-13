CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'in-review', 'awaiting-info', 'booked');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request_children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_number" integer GENERATED ALWAYS AS IDENTITY (sequence name "requests_reference_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"marital_status" "marital_status" NOT NULL,
	"spouse_name" text,
	"spouse_date_of_birth" date,
	"passport_number_enc" text NOT NULL,
	"passport_last4" varchar(4) NOT NULL,
	"passport_issue_date" date NOT NULL,
	"passport_expiry_date" date NOT NULL,
	"home_address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"employer_name" text NOT NULL,
	"employer_address" text NOT NULL,
	"employer_email" text NOT NULL,
	"mother_name" text NOT NULL,
	"mother_date_of_birth" date NOT NULL,
	"father_name" text NOT NULL,
	"father_date_of_birth" date NOT NULL,
	"visa_refused" boolean NOT NULL,
	"visa_issued" boolean NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("requests"."first_name", '') || ' ' || coalesce("requests"."middle_name", '') || ' ' || coalesce("requests"."last_name", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("requests"."email", '')), 'B') ||
        setweight(to_tsvector('simple', coalesce("requests"."employer_name", '')), 'C')
      ) STORED,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "requests_reference_number_unique" UNIQUE("reference_number"),
	CONSTRAINT "requests_spouse_when_married" CHECK ("requests"."marital_status" <> 'married' OR ("requests"."spouse_name" IS NOT NULL AND "requests"."spouse_date_of_birth" IS NOT NULL)),
	CONSTRAINT "requests_passport_dates" CHECK ("requests"."passport_expiry_date" > "requests"."passport_issue_date")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role",
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_children" ADD CONSTRAINT "request_children_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "request_children_request_id_idx" ON "request_children" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "requests_submitted_at_idx" ON "requests" USING btree ("submitted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "requests_status_submitted_at_idx" ON "requests" USING btree ("status","submitted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "requests_email_idx" ON "requests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "requests_search_idx" ON "requests" USING gin ("search_vector");