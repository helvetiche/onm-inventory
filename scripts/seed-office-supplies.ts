/**
 * Seeder for office supplies.
 * Run: npm run seed
 * Requires .env with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";

config({ path: ".env" });

const ITEMS_COLLECTION = "items";
const LEVELS_COLLECTION = "inventoryLevels";
const MOVEMENTS_COLLECTION = "inventoryMovements";

type OfficeSupplyItem = {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  stockMonth: number;
  stockYear: number;
  requestedQuantity: number;
  receivedQuantity: number;
};

const OFFICE_SUPPLIES: OfficeSupplyItem[] = [
  {
    sku: "OFF-PEN-001",
    name: "Ballpoint Pen Blue",
    description: "Standard blue ballpoint pen, medium point",
    category: "Writing",
    unit: "pcs",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 180,
    receivedQuantity: 120,
  },
  {
    sku: "OFF-PEN-002",
    name: "Ballpoint Pen Black",
    description: "Standard black ballpoint pen, medium point",
    category: "Writing",
    unit: "pcs",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 150,
    receivedQuantity: 130,
  },
  {
    sku: "OFF-PEN-003",
    name: "Gel Pen Assorted",
    description: "Pack of assorted color gel pens",
    category: "Writing",
    unit: "pack",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 60,
    receivedQuantity: 35,
  },
  {
    sku: "OFF-PEN-004",
    name: "Permanent Marker Black",
    description: "Fine point permanent marker for labeling",
    category: "Writing",
    unit: "pcs",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 90,
    receivedQuantity: 70,
  },
  {
    sku: "OFF-HIG-001",
    name: "Highlighter Yellow",
    description: "Fluorescent yellow highlighter",
    category: "Writing",
    unit: "pcs",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 75,
    receivedQuantity: 50,
  },
  {
    sku: "OFF-HIG-002",
    name: "Highlighter Assorted",
    description: "Pack of 4 assorted highlighters",
    category: "Writing",
    unit: "pack",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 40,
    receivedQuantity: 26,
  },
  {
    sku: "OFF-PEN-005",
    name: "Mechanical Pencil 0.7mm",
    description: "Lead holder with 0.7mm lead",
    category: "Writing",
    unit: "pcs",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 55,
    receivedQuantity: 41,
  },
  {
    sku: "OFF-PEN-006",
    name: "Wooden Pencil #2",
    description: "Standard #2 wooden pencils, box of 12",
    category: "Writing",
    unit: "box",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 35,
    receivedQuantity: 30,
  },
  {
    sku: "OFF-ERA-001",
    name: "Pencil Eraser",
    description: "White vinyl eraser for pencils",
    category: "Writing",
    unit: "pcs",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 95,
    receivedQuantity: 62,
  },
  {
    sku: "OFF-PAP-001",
    name: "Copy Paper A4",
    description: "500 sheets, 80gsm white copy paper",
    category: "Paper",
    unit: "box",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 120,
    receivedQuantity: 95,
  },
  {
    sku: "OFF-PAP-002",
    name: "Sticky Notes 3x3",
    description: "Yellow sticky notes, 12 pads per pack",
    category: "Paper",
    unit: "pack",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 50,
    receivedQuantity: 50,
  },
  {
    sku: "OFF-PAP-003",
    name: "Notepad A5",
    description: "Ruled notepad, 100 sheets",
    category: "Paper",
    unit: "pcs",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 85,
    receivedQuantity: 64,
  },
  {
    sku: "OFF-PAP-004",
    name: "Envelopes Letter Size",
    description: "White window envelopes, box of 500",
    category: "Paper",
    unit: "box",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 45,
    receivedQuantity: 40,
  },
  {
    sku: "OFF-STAP-001",
    name: "Stapler Desktop",
    description: "Standard desktop stapler",
    category: "Fasteners",
    unit: "pcs",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 20,
    receivedQuantity: 14,
  },
  {
    sku: "OFF-STAP-002",
    name: "Staples Standard",
    description: "5000 staples for standard staplers",
    category: "Fasteners",
    unit: "box",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 65,
    receivedQuantity: 60,
  },
  {
    sku: "OFF-CLIP-001",
    name: "Paper Clips Box",
    description: "Assorted sizes, box of 100",
    category: "Fasteners",
    unit: "box",
    stockMonth: 3,
    stockYear: 2026,
    requestedQuantity: 58,
    receivedQuantity: 42,
  },
  {
    sku: "OFF-TAP-001",
    name: "Scotch Tape Roll",
    description: "Clear tape, 12 rolls per pack",
    category: "Adhesives",
    unit: "pack",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 38,
    receivedQuantity: 18,
  },
  {
    sku: "OFF-SCI-001",
    name: "Scissors Office",
    description: "8-inch office scissors",
    category: "Tools",
    unit: "pcs",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 24,
    receivedQuantity: 20,
  },
  {
    sku: "OFF-RUL-001",
    name: "Ruler 12 inch",
    description: "Plastic ruler, clear with metric and imperial",
    category: "Tools",
    unit: "pcs",
    stockMonth: 2,
    stockYear: 2026,
    requestedQuantity: 46,
    receivedQuantity: 39,
  },
  {
    sku: "OFF-FOL-001",
    name: "Manila Folder",
    description: "Letter size manila folders",
    category: "Organization",
    unit: "pcs",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 140,
    receivedQuantity: 111,
  },
  {
    sku: "OFF-FOL-002",
    name: "3-Ring Binder 1 inch",
    description: "Standard 3-ring binder",
    category: "Organization",
    unit: "pcs",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 52,
    receivedQuantity: 46,
  },
  {
    sku: "OFF-CLIP-002",
    name: "Clipboard",
    description: "Plastic clipboard with clip",
    category: "Organization",
    unit: "pcs",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 28,
    receivedQuantity: 22,
  },
  {
    sku: "OFF-DESK-001",
    name: "Desk Organizer",
    description: "Multi-compartment pen and supply organizer",
    category: "Organization",
    unit: "pcs",
    stockMonth: 1,
    stockYear: 2026,
    requestedQuantity: 18,
    receivedQuantity: 9,
  },
];

const clearCollection = async (collectionName: string): Promise<number> => {
  const db = getFirestore();
  const colRef = db.collection(collectionName);
  let deletedCount = 0;

  // Delete in chunks to avoid large batch limits.
  while (true) {
    const snapshot = await colRef.limit(400).get();
    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    deletedCount += snapshot.size;
  }

  return deletedCount;
};

const run = async (): Promise<void> => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const allowDestructiveSeed = process.env.ALLOW_DESTRUCTIVE_SEED === "true";
  const seedConfirmToken = process.env.SEED_CONFIRM_TOKEN;

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
    );
    process.exit(1);
  }

  if (!allowDestructiveSeed) {
    console.error(
      "Seeder aborted. Set ALLOW_DESTRUCTIVE_SEED=true to allow clearing and reseeding inventory data."
    );
    process.exit(1);
  }

  if (seedConfirmToken !== "WIPE_AND_SEED_ITEMS") {
    console.error(
      "Seeder aborted. Set SEED_CONFIRM_TOKEN=WIPE_AND_SEED_ITEMS to confirm destructive reseed."
    );
    process.exit(1);
  }

  if (projectId.toLowerCase().includes("prod")) {
    console.error(
      "Seeder aborted for safety: project appears to be production."
    );
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();
  const col = db.collection(ITEMS_COLLECTION);
  const now = new Date();

  process.stdout.write("Clearing current inventory data...\n");
  const deletedItems = await clearCollection(ITEMS_COLLECTION);
  const deletedLevels = await clearCollection(LEVELS_COLLECTION);
  const deletedMovements = await clearCollection(MOVEMENTS_COLLECTION);
  process.stdout.write(
    `Deleted ${deletedItems} items, ${deletedLevels} inventory levels, ${deletedMovements} movements.\n`
  );

  process.stdout.write(`Seeding ${OFFICE_SUPPLIES.length} office supply items...\n`);

  for (const item of OFFICE_SUPPLIES) {
    await col.add({
      sku: item.sku,
      name: item.name,
      description: item.description ?? null,
      category: item.category,
      unit: item.unit,
      stockMonth: item.stockMonth,
      stockYear: item.stockYear,
      requestedQuantity: item.requestedQuantity,
      receivedQuantity: item.receivedQuantity,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    process.stdout.write(`  Added: ${item.sku} - ${item.name}\n`);
  }

  process.stdout.write("Done.\n");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
