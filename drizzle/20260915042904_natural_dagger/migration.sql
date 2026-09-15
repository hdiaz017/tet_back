ALTER TABLE "sales" ADD COLUMN "external_sale_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "products_id_seq";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "sale_items_id_seq";--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "sale_id" SET DATA TYPE uuid USING "sale_id"::uuid;--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "product_id" SET DATA TYPE uuid USING "product_id"::uuid;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "sales_id_seq";--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "sold_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "sold_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "unique_external_sale_id" UNIQUE("external_sale_id");