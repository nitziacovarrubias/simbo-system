PRAGMA foreign_keys=OFF;

ALTER TABLE "Quote" RENAME TO "Quote_old";
ALTER TABLE "QuoteItem" RENAME TO "QuoteItem_old";

CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "cuttingListId" TEXT,
    "createdById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0.16,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "extraCost" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "advancePayment" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "notes" TEXT,
    "clientDecisionNotes" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "exportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Quote_cuttingListId_fkey" FOREIGN KEY ("cuttingListId") REFERENCES "CuttingList" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Quote" (
    "id", "projectId", "createdById", "version", "status", "subtotal", "taxRate",
    "taxAmount", "laborCost", "discountAmount", "advancePayment", "total", "notes",
    "approvedAt", "rejectedAt", "createdAt", "updatedAt", "generatedAt"
)
SELECT
    "id", "projectId", "createdById", "version", "status", "subtotal", "taxRate",
    "taxAmount", "laborCost", "discountAmount", "advancePayment", "total", "notes",
    "approvedAt", "rejectedAt", "createdAt", "updatedAt", "createdAt"
FROM "Quote_old";

CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "materialId" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'CUSTOM',
    "sourcePieceId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "comments" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuoteItem_sourcePieceId_fkey" FOREIGN KEY ("sourcePieceId") REFERENCES "CuttingPiece" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "QuoteItem" (
    "id", "quoteId", "materialId", "sourceType", "description", "quantity", "unit",
    "unitPrice", "amount", "sortOrder", "createdAt", "updatedAt"
)
SELECT
    "id", "quoteId", "materialId",
    CASE WHEN "materialId" IS NOT NULL THEN 'MATERIAL' ELSE 'CUSTOM' END,
    "description", "quantity", "unit", "unitPrice", "total", "sortOrder", "createdAt", "updatedAt"
FROM "QuoteItem_old";

DROP TABLE "QuoteItem_old";
DROP TABLE "Quote_old";

CREATE UNIQUE INDEX "Quote_projectId_version_key" ON "Quote"("projectId", "version");
CREATE INDEX "Quote_projectId_idx" ON "Quote"("projectId");
CREATE INDEX "Quote_cuttingListId_idx" ON "Quote"("cuttingListId");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");
CREATE INDEX "QuoteItem_materialId_idx" ON "QuoteItem"("materialId");
CREATE INDEX "QuoteItem_sourcePieceId_idx" ON "QuoteItem"("sourcePieceId");
CREATE INDEX "QuoteItem_sourceType_idx" ON "QuoteItem"("sourceType");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
