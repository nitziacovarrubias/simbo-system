PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_CuttingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "designId" TEXT,
    "generatedById" TEXT,
    "validatedById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "designVersion" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "validationNotes" TEXT,
    "exportPath" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorizedAt" DATETIME,
    "rejectedAt" DATETIME,
    "exportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CuttingList_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CuttingList_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CuttingList_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CuttingList_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CuttingList" ("authorizedAt", "createdAt", "designId", "exportPath", "generatedAt", "generatedById", "id", "notes", "projectId", "rejectedAt", "status", "updatedAt", "validatedById", "validationNotes", "version")
SELECT "authorizedAt", "createdAt", "designId", "exportPath", "createdAt", "generatedById", "id", "notes", "projectId", "rejectedAt", "status", "updatedAt", "validatedById", "notes", "version" FROM "CuttingList";
DROP TABLE "CuttingList";
ALTER TABLE "new_CuttingList" RENAME TO "CuttingList";

CREATE TABLE "new_CuttingPiece" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cuttingListId" TEXT NOT NULL,
    "sourceModuleId" TEXT,
    "sourceModuleName" TEXT NOT NULL,
    "pieceName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "materialId" TEXT,
    "materialName" TEXT NOT NULL,
    "thicknessMm" REAL NOT NULL,
    "widthMm" REAL NOT NULL,
    "heightMm" REAL NOT NULL,
    "depthMm" REAL,
    "grainDirection" TEXT NOT NULL DEFAULT 'NONE',
    "edgeBanding" TEXT NOT NULL DEFAULT 'NONE',
    "comments" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CuttingPiece_cuttingListId_fkey" FOREIGN KEY ("cuttingListId") REFERENCES "CuttingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CuttingPiece_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CuttingPiece" ("category", "comments", "createdAt", "cuttingListId", "depthMm", "edgeBanding", "grainDirection", "heightMm", "id", "isManual", "materialId", "materialName", "pieceName", "quantity", "sortOrder", "sourceModuleName", "thicknessMm", "updatedAt", "widthMm")
SELECT 'GENERAL', "comments", "createdAt", "cuttingListId", "depthMm", COALESCE("edgeBanding", 'NONE'), COALESCE("grainDirection", 'NONE'), "heightMm", "id", true, "materialId", 'Material existente', "name", "quantity", "sortOrder", 'Módulo existente', COALESCE("thicknessMm", 0), "updatedAt", "widthMm" FROM "CuttingPiece";
DROP TABLE "CuttingPiece";
ALTER TABLE "new_CuttingPiece" RENAME TO "CuttingPiece";

CREATE UNIQUE INDEX "CuttingList_projectId_version_key" ON "CuttingList"("projectId", "version");
CREATE INDEX "CuttingList_projectId_idx" ON "CuttingList"("projectId");
CREATE INDEX "CuttingList_designId_idx" ON "CuttingList"("designId");
CREATE INDEX "CuttingList_status_idx" ON "CuttingList"("status");
CREATE INDEX "CuttingPiece_cuttingListId_idx" ON "CuttingPiece"("cuttingListId");
CREATE INDEX "CuttingPiece_sourceModuleId_idx" ON "CuttingPiece"("sourceModuleId");
CREATE INDEX "CuttingPiece_materialId_idx" ON "CuttingPiece"("materialId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
