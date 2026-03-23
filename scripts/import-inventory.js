const inventoryItems = [
  { id: 1, name: "Scotch Tape (Small)", stockAmount: 3, unit: "pieces" },
  { id: 2, name: "Scotch Tape (Big)", stockAmount: 3, unit: "pieces" },
  { id: 3, name: "My Gel Pen (Black)", stockAmount: 0, unit: "pieces" },
  { id: 4, name: "HBW Pen (Black)", stockAmount: 15, unit: "pieces" },
  { id: 5, name: "Correction Tape", stockAmount: 10, unit: "pieces" },
  { id: 6, name: "Index Tab (Red)", stockAmount: 8, unit: "pieces" },
  { id: 7, name: "Plastic Fastener", stockAmount: 4, unit: "pieces" },
  { id: 8, name: "Heavy Duty Staple Wire", stockAmount: 7, unit: "pieces" },
  { id: 9, name: "Highlighter (Green)", stockAmount: 5, unit: "pieces" },
  { id: 10, name: "Highlighter (Violet)", stockAmount: 1, unit: "pieces" },
  { id: 11, name: "Sticky Note (Tag)", stockAmount: 14, unit: "pieces" },
  { id: 12, name: "Battery (AA)", stockAmount: 6, unit: "pieces" },
  { id: 13, name: "Pilot Fine Marker", stockAmount: 5, unit: "pieces" },
  { id: 14, name: "Glue Stick", stockAmount: 1, unit: "pieces" },
  { id: 15, name: "Binder Clip (3/4 inch)", stockAmount: 3, unit: "box", pieces: 36 },
  { id: 16, name: "Binder Clip (1 inch)", stockAmount: 2, unit: "box", pieces: 24 },
  { id: 17, name: "Binder Clip (1-1/4 inch)", stockAmount: 4, unit: "box", pieces: 48 },
  { id: 18, name: "Binder Clip (2 inch)", stockAmount: 3, unit: "box", pieces: 36 },
  { id: 19, name: "Mongol Pencil (No. 2)", stockAmount: 11, unit: "pieces" },
  { id: 20, name: "White Envelope", stockAmount: 700, unit: "pieces" },
  { id: 21, name: "Plastic Fastener (Long)", stockAmount: 1, unit: "pieces" },
  { id: 22, name: "Sticky Note (3x4 inch)", stockAmount: 6, unit: "pieces" },
  { id: 23, name: "Sticky Note (3x3 inch)", stockAmount: 15, unit: "pieces" },
  { id: 24, name: "Sticky Note (3x2 inch)", stockAmount: 7, unit: "pieces" },
  { id: 25, name: "Staple Wire #35", stockAmount: 8, unit: "pieces" }
];
const moreItems = [
  { id: 26, name: "Paper Clip (50mm)", stockAmount: 22, unit: "pieces" },
  { id: 27, name: "Paper Clip (33mm)", stockAmount: 6, unit: "pieces" },
  { id: 28, name: "Red Folder (Long)", stockAmount: 249, unit: "pieces" },
  { id: 29, name: "White Folder (Long)", stockAmount: 3100, unit: "pieces" },
  { id: 30, name: "Record Book", stockAmount: 1, unit: "pieces" },
  { id: 31, name: "A4 Paper", stockAmount: 5, unit: "ream" },
  { id: 32, name: "Long Paper", stockAmount: 16, unit: "pieces" },
  { id: 33, name: "A3 Paper", stockAmount: 18, unit: "pieces" },
  { id: 34, name: "Brown Envelope (Short)", stockAmount: 35, unit: "pieces" },
  { id: 35, name: "Brown Envelope (Long)", stockAmount: 49, unit: "pieces" },
  { id: 36, name: "Expandable Envelope (Brown)", stockAmount: 24, unit: "pieces" },
  { id: 37, name: "Expandable Envelope (Red)", stockAmount: 16, unit: "pieces" },
  { id: 38, name: "Columnar Book (3 columns)", stockAmount: 49, unit: "pieces" },
  { id: 39, name: "Arch File (Green)", stockAmount: 93, unit: "pieces" },
  { id: 40, name: "Alcohol", stockAmount: 0, unit: "pieces" },
  { id: 41, name: "Dishwashing Liquid", stockAmount: 0, unit: "pieces" }
];

const allItems = [...inventoryItems, ...moreItems];

async function importInventory() {
  console.log(`Starting import of ${allItems.length} items...`);
  
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    
    try {
      const response = await fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku: `ITEM-${String(item.id).padStart(3, '0')}`,
          name: item.name,
          unit: item.unit,
          stockAmount: item.stockAmount,
          stockYear: 2026
        })
      });

      if (response.ok) {
        console.log(`✅ Added: ${item.name}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to add ${item.name}: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error adding ${item.name}:`, error.message);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Import completed!');
}

// Run the import
importInventory();