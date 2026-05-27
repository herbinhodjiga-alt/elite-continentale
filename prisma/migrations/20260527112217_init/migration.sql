-- CreateTable
CREATE TABLE "Registration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ref" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "ddn" DATETIME NOT NULL,
    "lieuNaissance" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "club" TEXT,
    "pdfPath" TEXT,
    "pdfName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_ref_key" ON "Registration"("ref");
