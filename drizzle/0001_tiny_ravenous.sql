ALTER TABLE "images" drop column "is_nsfw";--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "is_nsfw" boolean GENERATED ALWAYS AS ((rating <> 'general' AND rating <> 'sensitive')) STORED NOT NULL;--> statement-breakpoint
CREATE INDEX "images_feed_idx" ON "images" USING btree ("is_nsfw","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);
