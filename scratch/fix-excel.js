const ExcelJS = require('exceljs');

async function fixDates() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('asset-import-template.xlsx');
  const worksheet = workbook.worksheets[0];

  const dateCols = [17, 21, 22, 25, 26]; // Purchase, Warranty, AMC dates

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    
    dateCols.forEach(colIdx => {
      const cell = row.getCell(colIdx);
      if (cell && cell.value) {
        let val = cell.value.toString().trim();
        // if it's like 2024-01-32, fix it
        const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          let year = parseInt(match[1]);
          let month = parseInt(match[2]);
          let day = parseInt(match[3]);
          
          if (day > 28) {
            // just set day to 01 and add month
            day = day % 28;
            if (day === 0) day = 1;
            month += 1;
            if (month > 12) {
              month = 1;
              year += 1;
            }
            val = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            cell.value = val;
          }
        }
      }
    });
    row.commit();
  }

  await workbook.xlsx.writeFile('asset-import-template-fixed.xlsx');
  console.log("Fixed excel file created.");
}

fixDates().catch(console.error);
