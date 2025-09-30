-- CreateIndex
CREATE INDEX "Vocabulary_status_idx" ON "public"."Vocabulary"("status");

-- CreateIndex
CREATE INDEX "Vocabulary_status_topicId_idx" ON "public"."Vocabulary"("status", "topicId");
