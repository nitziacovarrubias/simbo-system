-- Add editor visual state to normalized design modules.
ALTER TABLE "DesignModule" ADD COLUMN "colorHex" TEXT NOT NULL DEFAULT '#81949C';
ALTER TABLE "DesignModule" ADD COLUMN "hasCollision" BOOLEAN NOT NULL DEFAULT false;

-- Keep the initial parametric catalog available even when the existing database is not reseeded.
INSERT OR IGNORE INTO "ModuleTemplate" (
  "id", "code", "name", "category", "defaultWidthMm", "defaultHeightMm",
  "defaultDepthMm", "parameterJson", "isActive", "createdAt", "updatedAt"
) VALUES
  ('template-base-cabinet', 'BASE-CABINET-001', 'Gabinete bajo', 'Cocina', 800, 720, 560, '{}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('template-wall-cabinet', 'WALL-CABINET-001', 'Alacena', 'Cocina', 800, 700, 350, '{}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('template-tall-cabinet', 'TALL-CABINET-001', 'Torre', 'Cocina', 600, 2100, 560, '{}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('template-shelf', 'SHELF-001', 'Repisa', 'Cocina', 800, 30, 300, '{}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('template-island', 'ISLAND-001', 'Isla', 'Cocina', 1800, 900, 900, '{}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('template-appliance', 'APPLIANCE-PLACEHOLDER-001', 'Electrodoméstico', 'Electrodomésticos', 600, 850, 600, '{}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "ModuleTemplate"
SET "name" = 'Gabinete bajo', "defaultWidthMm" = 800, "defaultHeightMm" = 720,
    "defaultDepthMm" = 560, "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'BASE-CABINET-001';

UPDATE "ModuleTemplate"
SET "name" = 'Alacena', "defaultWidthMm" = 800, "defaultHeightMm" = 700,
    "defaultDepthMm" = 350, "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'WALL-CABINET-001';

-- Backfill template relations from the existing module kind.
UPDATE "DesignModule"
SET "templateId" = (
  SELECT "id" FROM "ModuleTemplate" WHERE "code" = 'BASE-CABINET-001' LIMIT 1
)
WHERE "templateId" IS NULL AND "kind" = 'BASE_CABINET';

UPDATE "DesignModule"
SET "templateId" = (
  SELECT "id" FROM "ModuleTemplate" WHERE "code" = 'WALL-CABINET-001' LIMIT 1
)
WHERE "templateId" IS NULL AND "kind" = 'WALL_CABINET';

UPDATE "DesignModule"
SET "templateId" = (
  SELECT "id" FROM "ModuleTemplate" WHERE "code" = 'TALL-CABINET-001' LIMIT 1
)
WHERE "templateId" IS NULL AND "kind" = 'TALL_CABINET';

UPDATE "DesignModule"
SET "templateId" = (
  SELECT "id" FROM "ModuleTemplate" WHERE "code" = 'SHELF-001' LIMIT 1
)
WHERE "templateId" IS NULL AND "kind" = 'SHELF';

UPDATE "DesignModule"
SET "templateId" = (
  SELECT "id" FROM "ModuleTemplate" WHERE "code" = 'ISLAND-001' LIMIT 1
)
WHERE "templateId" IS NULL AND "kind" = 'ISLAND';

UPDATE "DesignModule"
SET "templateId" = (
  SELECT "id" FROM "ModuleTemplate" WHERE "code" = 'APPLIANCE-PLACEHOLDER-001' LIMIT 1
)
WHERE "templateId" IS NULL AND "kind" = 'APPLIANCE_PLACEHOLDER';

-- Add the five basic visual materials without removing existing catalog data.
INSERT OR IGNORE INTO "Material" (
  "id", "code", "name", "category", "unit", "cost", "thicknessMm", "colorHex",
  "texturePath", "supplier", "isActive", "createdAt", "updatedAt"
) VALUES
  ('material-mdf-white-18', 'MDF-BLANCO-18', 'MDF Blanco 18mm', 'Madera', 'SHEET', 780, 18, '#F2F2F2', NULL, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('material-walnut-18', 'MELAMINA-NOGAL-18', 'Melamina Nogal 18mm', 'Madera', 'SHEET', 920, 18, '#8A5A3B', NULL, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('material-mdf-black-18', 'MDF-NEGRO-18', 'MDF Negro 18mm', 'Madera', 'SHEET', 860, 18, '#222222', NULL, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('material-gray-quartz', 'CUARZO-GRIS', 'Cubierta Cuarzo Gris', 'Cubierta', 'SQUARE_METER', 1650, 30, '#777A7C', NULL, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('material-natural-wood', 'MADERA-NATURAL', 'Madera Natural', 'Madera', 'BOARD', 1200, 18, '#B8895B', NULL, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
