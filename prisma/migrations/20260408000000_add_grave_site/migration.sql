-- CreateTable
CREATE TABLE "GraveSite" (
    "id" TEXT NOT NULL,
    "familyRegisterId" TEXT NOT NULL,
    "section" TEXT,
    "number" TEXT,
    "graveType" TEXT,
    "contractedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraveSite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GraveSite" ADD CONSTRAINT "GraveSite_familyRegisterId_fkey" FOREIGN KEY ("familyRegisterId") REFERENCES "FamilyRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;
