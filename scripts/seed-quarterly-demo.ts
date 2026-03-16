/**
 * Demo seeder for quarterly inventory system - PROPER DESIGN
 * Run: npm run seed:demo
 * Creates 5 items with quarterly data stored in nested objects (1 item = 1 document)
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";

config({ path: ".env" });

const ITEMS_COLLECTION = "items";

type QuarterlyData = {
  requestedQuantity: number;
  receivedQuantity: number;
  baseQuantity: number;
};

type DemoItem = {
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  stockYear: number;
  q1: QuarterlyData;
  q2: QuarterlyData;
  q3: QuarterlyData;
  q4: QuarterlyData;
};

const DEMO_ITEMS: DemoItem[] = [
  {
    sku: "DEMO-001",
    name: "Blue Ballpoint Pens",
    description: "Standard blue ink ballpoint pens for office use",
    category: "Writing",
    unit: "pcs",
    stockYear: 2026,
    q1: { requestedQuantity: 200, receivedQuantity: 150, baseQuantity: 0 },
    q2: { requestedQuantity: 50, receivedQuantity: 0, baseQuantity: 50 }, // Q1 remaining
    q3: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
    q4: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
  },
  {
    sku: "DEMO-002", 
    name: "A4 Copy Paper",
    description: "White 80gsm copy paper, 500 sheets per ream",
    category: "Paper",
    unit: "ream",
    stockYear: 2026,
    q1: { requestedQuantity: 100, receivedQuantity: 100, baseQuantity: 0 },
    q2: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 }, // Nothing left
    q3: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
    q4: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
  },
  {
    sku: "DEMO-003",
    name: "Desktop Staplers",
    description: "Heavy-duty desktop staplers for office use",
    category: "Tools",
    unit: "pcs",
    stockYear: 2026,
    q1: { requestedQuantity: 30, receivedQuantity: 25, baseQuantity: 0 },
    q2: { requestedQuantity: 5, receivedQuantity: 0, baseQuantity: 5 }, // Q1 remaining
    q3: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
    q4: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
  },
  {
    sku: "DEMO-004",
    name: "Yellow Sticky Notes",
    description: "3x3 inch yellow sticky note pads",
    category: "Paper",
    unit: "pack",
    stockYear: 2026,
    q1: { requestedQuantity: 75, receivedQuantity: 60, baseQuantity: 0 },
    q2: { requestedQuantity: 15, receivedQuantity: 0, baseQuantity: 15 }, // Q1 remaining
    q3: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
    q4: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
  },
  {
    sku: "DEMO-005",
    name: "Black Permanent Markers",
    description: "Fine tip permanent markers for labeling",
    category: "Writing",
    unit: "pcs",
    stockYear: 2026,
    q1: { requestedQuantity: 50, receivedQuantity: 35, baseQuantity: 0 },
    q2: { requestedQuantity: 15, receivedQuantity: 0, baseQuantity: 15 }, // Q1 remaining
    q3: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
    q4: { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 },
  },
];

const clearCollection = async (collectionName: string): Promise<number> => {
  const db = getFirestore();
  const colRef = db.collection(collectionName);
  let deletedCount = 0;

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

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
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

  console.log("🗑️  Clearing existing inventory data...");
  const deletedItems = await clearCollection(ITEMS_COLLECTION);
  console.log(`✅ Deleted ${deletedItems} existing items.`);

  console.log(`\n📦 Seeding ${DEMO_ITEMS.length} items with quarterly data...`);
  console.log("=" .repeat(80));

  for (const item of DEMO_ITEMS) {
    await col.add({
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      stockYear: item.stockYear,
      q1: item.q1,
      q2: item.q2,
      q3: item.q3,
      q4: item.q4,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`✅ ${item.name} (${item.sku})`);
  }

  console.log("=" .repeat(80));
  console.log("🎉 PROPER quarterly data structure created!");
  console.log("");
  console.log("📊 Database Structure:");
  console.log("   • 5 documents total (1 per item)");
  console.log("   • Each document contains q1, q2, q3, q4 nested objects");
  console.log("   • No data duplication - efficient and scalable!");
  console.log("");
  console.log("🔄 When you switch quarters, you'll see:");
  console.log("   • Q1: Original requests/received/remaining");
  console.log("   • Q2: Rollover data (Q1 remaining becomes Q2 requested)");
  console.log("   • Q3 & Q4: Empty (0/0/0)");
  console.log("");
  console.log("🚀 Now switch between quarters to see it work!");
};

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});