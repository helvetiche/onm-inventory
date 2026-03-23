import ExcelJS from "exceljs";
import type { InventoryItem } from "@/lib/db/types";

export type ExcelExportOptions = {
  items: InventoryItem[];
  quarter: number;
  year: number;
  month?: string;
};

export async function exportInventoryToExcel({
  items,
  quarter,
  year,
  month = "MARCH",
}: ExcelExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Inventory");

  // Title
  const title = `STOCK AS OF ${month} 09, ${year}`;
  worksheet.mergeCells("A1:P1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { name: "Calibri", size: 14, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.border = {
    top: { style: "medium" },
    left: { style: "medium" },
    bottom: { style: "medium" },
    right: { style: "medium" },
  };

  // Main header row (row 2)
  const mainHeaderRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    "1ST QUARTER",
    "",
    "",
    "2ND QUARTER",
    "",
    "",
    "3RD QUARTER",
    "",
    "",
    "4TH QUARTER",
    "",
    "",
  ]);

  // Sub-header row (row 3)
  const subHeaderRow = worksheet.addRow([
    "STOCK NO.",
    "ITEMS NAME",
    "PCS",
    "UNIT",
    "REQUEST",
    "RECEIVED",
    "BALANCE",
    "REQUEST",
    "RECEIVED",
    "BALANCE",
    "REQUEST",
    "RECEIVED",
    "BALANCE",
    "REQUEST",
    "RECEIVED",
    "BALANCE",
  ]);

  // Merge cells for quarter headers only
  worksheet.mergeCells("E2:G2"); // 1ST QUARTER
  worksheet.mergeCells("H2:J2"); // 2ND QUARTER
  worksheet.mergeCells("K2:M2"); // 3RD QUARTER
  worksheet.mergeCells("N2:P2"); // 4TH QUARTER

  // Style header rows
  [mainHeaderRow, subHeaderRow].forEach((row) => {
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 10, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        bottom: { style: "medium" },
        right: { style: "medium" },
      };
    });
  });

  // Add data rows
  items.forEach((item, index) => {
    const q1 = item.q1 || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
    const q2 = item.q2 || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
    const q3 = item.q3 || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
    const q4 = item.q4 || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };

    // Calculate totals and balances for each quarter
    // Q1
    const q1Total = (q1.baseQuantity || 0) + q1.requestedQuantity;
    const q1Remaining = q1Total - q1.receivedQuantity;
    const q1Balance = q1Remaining > 0 ? q1Remaining : 0; // Show 0 if negative

    // Q2 - if Q1 remaining is positive, add to requested; if negative, add to received
    const q2RequestedWithRollover = (q2.baseQuantity || 0) + q2.requestedQuantity + (q1Remaining > 0 ? q1Remaining : 0);
    const q2ReceivedWithRollover = q2.receivedQuantity + (q1Remaining < 0 ? Math.abs(q1Remaining) : 0);
    const q2Remaining = q2RequestedWithRollover - q2ReceivedWithRollover;
    const q2Balance = q2Remaining > 0 ? q2Remaining : 0; // Show 0 if negative

    // Q3 - if Q2 remaining is positive, add to requested; if negative, add to received
    const q3RequestedWithRollover = (q3.baseQuantity || 0) + q3.requestedQuantity + (q2Remaining > 0 ? q2Remaining : 0);
    const q3ReceivedWithRollover = q3.receivedQuantity + (q2Remaining < 0 ? Math.abs(q2Remaining) : 0);
    const q3Remaining = q3RequestedWithRollover - q3ReceivedWithRollover;
    const q3Balance = q3Remaining > 0 ? q3Remaining : 0; // Show 0 if negative

    // Q4 - if Q3 remaining is positive, add to requested; if negative, add to received
    const q4RequestedWithRollover = (q4.baseQuantity || 0) + q4.requestedQuantity + (q3Remaining > 0 ? q3Remaining : 0);
    const q4ReceivedWithRollover = q4.receivedQuantity + (q3Remaining < 0 ? Math.abs(q3Remaining) : 0);
    const q4Remaining = q4RequestedWithRollover - q4ReceivedWithRollover;
    const q4Balance = q4Remaining > 0 ? q4Remaining : 0; // Show 0 if negative

    const dataRow = worksheet.addRow([
      index + 1,
      item.name,
      item.stockAmount,
      item.unit,
      q1Total,
      q1.receivedQuantity,
      q1Balance,
      q2RequestedWithRollover,
      q2ReceivedWithRollover,
      q2Balance,
      q3RequestedWithRollover,
      q3ReceivedWithRollover,
      q3Balance,
      q4RequestedWithRollover,
      q4ReceivedWithRollover,
      q4Balance,
    ]);

    // Style data row
    dataRow.eachCell((cell, colNumber) => {
      // First 4 columns are bold
      if (colNumber <= 4) {
        cell.font = { name: "Calibri", bold: true };
      } else {
        cell.font = { name: "Calibri" };
      }

      // Center alignment for all except item name
      if (colNumber === 2) {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Color coding for quarterly columns
      // Columns: 5,8,11,14 = REQUEST (light green)
      // Columns: 6,9,12,15 = RECEIVED (light orange)
      // Columns: 7,10,13,16 = BALANCE (light red)
      if ([5, 8, 11, 14].includes(colNumber)) {
        // REQUEST - light green
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE8F5E9" }, // Very light green
        };
      } else if ([6, 9, 12, 15].includes(colNumber)) {
        // RECEIVED - light orange
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFE0B2" }, // Very light orange
        };
      } else if ([7, 10, 13, 16].includes(colNumber)) {
        // BALANCE - light red
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFEBEE" }, // Very light red
        };
      }

      // Borders
      cell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        bottom: { style: "medium" },
        right: { style: "medium" },
      };
    });
  });

  // Set column widths
  worksheet.columns = [
    { width: 8 },  // STOCK NO.
    { width: 30 }, // ITEMS NAME
    { width: 8 },  // P.C.S
    { width: 10 }, // UNIT
    { width: 10 }, // Q1 REQUEST
    { width: 10 }, // Q1 RECEIVED
    { width: 10 }, // Q1 BALANCE
    { width: 10 }, // Q2 REQUEST
    { width: 10 }, // Q2 RECEIVED
    { width: 10 }, // Q2 BALANCE
    { width: 10 }, // Q3 REQUEST
    { width: 10 }, // Q3 RECEIVED
    { width: 10 }, // Q3 BALANCE
    { width: 10 }, // Q4 REQUEST
    { width: 10 }, // Q4 RECEIVED
    { width: 10 }, // Q4 BALANCE
  ];

  // Generate filename
  const filename = `Inventory_Q${quarter}_${year}_${month}.xlsx`;

  // Write file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
