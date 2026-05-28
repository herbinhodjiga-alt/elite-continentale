-- Create Table for PostgreSQL
CREATE TABLE "Registration" (
  "id" SERIAL PRIMARY KEY,
  "ref" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "prenom" TEXT NOT NULL,
  "ddn" TIMESTAMP(3) NOT NULL,
  "lieuNaissance" TEXT NOT NULL,
  "tel" TEXT NOT NULL,
  "categorie" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "ville" TEXT NOT NULL,
  "club" TEXT,
  "pdfPath" TEXT,
  "pdfName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Registration_ref_key" ON "Registration"("ref");
