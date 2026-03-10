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

type OfficeSupplyItem = {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
};

const OFFICE_SUPPLIES: OfficeSupplyItem[] = [
  {
    sku: "OFF-PEN-001",
    name: "Ballpoint Pen Blue",
    description: "Standard blue ballpoint pen, medium point",
    category: "Writing",
    unit: "pcs",
  },
  {
    sku: "OFF-PEN-002",
    name: "Ballpoint Pen Black",
    description: "Standard black ballpoint pen, medium point",
    category: "Writing",
    unit: "pcs",
  },
  {
    sku: "OFF-PEN-003",
    name: "Gel Pen Assorted",
    description: "Pack of assorted color gel pens",
    category: "Writing",
    unit: "pack",
  },
  {
    sku: "OFF-PEN-004",
    name: "Permanent Marker Black",
    description: "Fine point permanent marker for labeling",
    category: "Writing",
    unit: "pcs",
  },
  {
    sku: "OFF-HIG-001",
    name: "Highlighter Yellow",
    description: "Fluorescent yellow highlighter",
    category: "Writing",
    unit: "pcs",
  },
  {
    sku: "OFF-HIG-002",
    name: "Highlighter Assorted",
    description: "Pack of 4 assorted highlighters",
    category: "Writing",
    unit: "pack",
  },
  {
    sku: "OFF-PEN-005",
    name: "Mechanical Pencil 0.7mm",
    description: "Lead holder with 0.7mm lead",
    category: "Writing",
    unit: "pcs",
  },
  {
    sku: "OFF-PEN-006",
    name: "Wooden Pencil #2",
    description: "Standard #2 wooden pencils, box of 12",
    category: "Writing",
    unit: "box",
  },
  {
    sku: "OFF-ERA-001",
    name: "Pencil Eraser",
    description: "White vinyl eraser for pencils",
    category: "Writing",
    unit: "pcs",
  },
  {
    sku: "OFF-PAP-001",
    name: "Copy Paper A4",
    description: "500 sheets, 80gsm white copy paper",
    category: "Paper",
    unit: "box",
  },
  {
    sku: "OFF-PAP-002",
    name: "Sticky Notes 3x3",
    description: "Yellow sticky notes, 12 pads per pack",
    category: "Paper",
    unit: "pack",
  },
  {
    sku: "OFF-PAP-003",
    name: "Notepad A5",
    description: "Ruled notepad, 100 sheets",
    category: "Paper",
    unit: "pcs",
  },
  {
    sku: "OFF-PAP-004",
    name: "Envelopes Letter Size",
    description: "White window envelopes, box of 500",
    category: "Paper",
    unit: "box",
  },
  {
    sku: "OFF-STAP-001",
    name: "Stapler Desktop",
    description: "Standard desktop stapler",
    category: "Fasteners",
    unit: "pcs",
  },
  {
    sku: "OFF-STAP-002",
    name: "Staples Standard",
    description: "5000 staples for standard staplers",
    category: "Fasteners",
    unit: "box",
  },
  {
    sku: "OFF-CLIP-001",
    name: "Paper Clips Box",
    description: "Assorted sizes, box of 100",
    category: "Fasteners",
    unit: "box",
  },
  {
    sku: "OFF-TAP-001",
    name: "Scotch Tape Roll",
    description: "Clear tape, 12 rolls per pack",
    category: "Adhesives",
    unit: "pack",
  },
  {
    sku: "OFF-SCI-001",
    name: "Scissors Office",
    description: "8-inch office scissors",
    category: "Tools",
    unit: "pcs",
  },
  {
    sku: "OFF-RUL-001",
    name: "Ruler 12 inch",
    description: "Plastic ruler, clear with metric and imperial",
    category: "Tools",
    unit: "pcs",
  },
  {
    sku: "OFF-FOL-001",
    name: "Manila Folder",
    description: "Letter size manila folders",
    category: "Organization",
    unit: "pcs",
  },
  {
    sku: "OFF-FOL-002",
    name: "3-Ring Binder 1 inch",
    description: "Standard 3-ring binder",
    category: "Organization",
    unit: "pcs",
  },
  {
    sku: "OFF-CLIP-002",
    name: "Clipboard",
    description: "Plastic clipboard with clip",
    category: "Organization",
    unit: "pcs",
  },
  {
    sku: "OFF-DESK-001",
    name: "Desk Organizer",
    description: "Multi-compartment pen and supply organizer",
    category: "Organization",
    unit: "pcs",
  },
];

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

  console.log(`Seeding ${OFFICE_SUPPLIES.length} office supply items...`);

  for (const item of OFFICE_SUPPLIES) {
    await col.add({
      sku: item.sku,
      name: item.name,
      description: item.description ?? null,
      category: item.category,
      unit: item.unit,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  Added: ${item.sku} - ${item.name}`);
  }

  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
