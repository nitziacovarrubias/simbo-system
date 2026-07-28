PRAGMA foreign_keys=OFF;

CREATE TABLE "_Alert_backup" AS SELECT * FROM "Alert";

CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "assignedPersonName" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'CUSTOM',
    "startDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Activity" (
    "id", "projectId", "assignedUserId", "assignedPersonName", "title", "description",
    "stage", "startDate", "dueDate", "completedAt", "status", "priority",
    "progressPercent", "notes", "createdAt", "updatedAt"
)
SELECT
    "id",
    "projectId",
    "assignedToId",
    NULL,
    "title",
    "description",
    CASE
      WHEN UPPER(COALESCE("stage", '')) LIKE '%DISE%' THEN 'DESIGN_REVIEW'
      WHEN UPPER(COALESCE("stage", '')) LIKE '%COT%' THEN 'QUOTATION'
      WHEN UPPER(COALESCE("stage", '')) LIKE '%CORTE%' OR UPPER(COALESCE("stage", '')) LIKE '%DESPIECE%' THEN 'CUTTING'
      WHEN UPPER(COALESCE("stage", '')) LIKE '%PRODU%' THEN 'PRODUCTION'
      WHEN UPPER(COALESCE("stage", '')) LIKE '%INSTAL%' THEN 'INSTALLATION'
      WHEN UPPER(COALESCE("stage", '')) LIKE '%ENTREG%' THEN 'DELIVERY'
      WHEN UPPER(COALESCE("stage", '')) LIKE '%CIERRE%' THEN 'CLOSURE'
      ELSE 'CUSTOM'
    END,
    COALESCE("startDate", "createdAt"),
    COALESCE("dueDate", "startDate", "createdAt"),
    "completedAt",
    CASE
      WHEN "status" = 'PENDING' THEN 'TODO'
      WHEN "status" = 'CANCELED' THEN 'CANCELLED'
      ELSE "status"
    END,
    "priority",
    CASE
      WHEN "status" = 'DONE' THEN 100
      WHEN "status" = 'IN_PROGRESS' THEN 50
      ELSE 0
    END,
    NULL,
    "createdAt",
    "updatedAt"
FROM "Activity";

DROP TABLE "Alert";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";

CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "activityId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" DATETIME,
    "resolvedAt" DATETIME,
    "resolutionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alert_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Alert" (
    "id", "projectId", "activityId", "createdById", "title", "description", "type",
    "priority", "status", "dueDate", "resolvedAt", "resolutionNotes", "createdAt", "updatedAt"
)
SELECT
    "id", "projectId", "activityId", "createdById", "title", "message", 'INCIDENT',
    "priority",
    CASE WHEN "resolvedAt" IS NOT NULL THEN 'RESOLVED' ELSE 'OPEN' END,
    NULL,
    "resolvedAt",
    NULL,
    "createdAt",
    "updatedAt"
FROM "_Alert_backup"
WHERE "projectId" IS NOT NULL;

DROP TABLE "_Alert_backup";

CREATE INDEX "Activity_projectId_idx" ON "Activity"("projectId");
CREATE INDEX "Activity_assignedUserId_idx" ON "Activity"("assignedUserId");
CREATE INDEX "Activity_status_idx" ON "Activity"("status");
CREATE INDEX "Activity_priority_idx" ON "Activity"("priority");
CREATE INDEX "Activity_dueDate_idx" ON "Activity"("dueDate");
CREATE INDEX "Alert_projectId_idx" ON "Alert"("projectId");
CREATE INDEX "Alert_activityId_type_status_idx" ON "Alert"("activityId", "type", "status");
CREATE INDEX "Alert_priority_idx" ON "Alert"("priority");
CREATE INDEX "Alert_status_idx" ON "Alert"("status");
CREATE INDEX "Alert_dueDate_idx" ON "Alert"("dueDate");

PRAGMA foreign_keys=ON;
