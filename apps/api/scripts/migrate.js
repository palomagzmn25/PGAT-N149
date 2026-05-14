const { Client } = require('pg');

const sql = `
CREATE SCHEMA IF NOT EXISTS "public";

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'CAPTURISTA', 'REVISOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OcrStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'CAPTURISTA',
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Template" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "filePath" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "placeholders" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GeneratedDocument" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "instrumentType" TEXT NOT NULL,
  "formData" JSONB NOT NULL,
  "outputPath" TEXT,
  "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OcrJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "inputPath" TEXT NOT NULL,
  "outputPath" TEXT,
  "status" "OcrStatus" NOT NULL DEFAULT 'PENDING',
  "rawText" TEXT,
  "errorReport" TEXT,
  "provider" TEXT,
  "pageCount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OcrJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "ip" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Template" ADD CONSTRAINT "Template_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  NOT VALID;
ALTER TABLE "Template" VALIDATE CONSTRAINT "Template_createdById_fkey";

ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  NOT VALID;
ALTER TABLE "GeneratedDocument" VALIDATE CONSTRAINT "GeneratedDocument_templateId_fkey";

ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  NOT VALID;
ALTER TABLE "GeneratedDocument" VALIDATE CONSTRAINT "GeneratedDocument_userId_fkey";

ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  NOT VALID;
ALTER TABLE "OcrJob" VALIDATE CONSTRAINT "OcrJob_userId_fkey";

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  NOT VALID;
ALTER TABLE "AuditLog" VALIDATE CONSTRAINT "AuditLog_userId_fkey";
`;

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  console.log('Running database migration...');
  try {
    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (err) {
    // Ignore duplicate constraint errors (already applied)
    if (err.code === '42710' || err.code === '42P07') {
      console.log('Schema already exists, skipping');
    } else {
      console.error('Migration error:', err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

migrate();
