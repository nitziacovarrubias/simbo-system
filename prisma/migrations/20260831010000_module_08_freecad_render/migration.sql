-- Module 08: metadatos de artefactos CAD y estado de generación de renders.
ALTER TABLE "Render" ADD COLUMN "fcstdPath" TEXT;
ALTER TABLE "Render" ADD COLUMN "stepPath" TEXT;
ALTER TABLE "Render" ADD COLUMN "stlPath" TEXT;
ALTER TABLE "Render" ADD COLUMN "objPath" TEXT;
ALTER TABLE "Render" ADD COLUMN "generatedAt" DATETIME;
ALTER TABLE "Render" ADD COLUMN "failureMessage" TEXT;
