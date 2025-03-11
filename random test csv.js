const fs = require('fs');
const csv = require('csv-parser');

console.log('reading file');

let completed = 0; // Лічильник завершених потоків

function checkExit() {
  completed++;
  if (completed === 2) { // Виходимо тільки коли обидва файли прочитані
    console.log('All CSV files processed. Exiting...');
    process.exit(0);
  }
}

function processCSV(filePath, maxRowCount) {
  return new Promise((resolve, reject) => {
    const rows = []; // Масив для збереження рядків
    let rowCount = 0;
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (rowCount < maxRowCount) {
          rows.push(row);
          rowCount++;
        }
        if (rowCount === maxRowCount) {
          stream.destroy(); // Зупиняємо потік після 10 рядків
        }
      })
      .on('close', () => { // Використовуємо 'close' для коректного завершення після destroy()
        console.log(`CSV file successfully processed (${maxRowCount} rows).`);
        resolve(rows); // Повертаємо 10 рядків
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// Запускаємо обробку двох файлів
processCSV('cinema_hall_ticket_sales.csv', 'File 1');
processCSV('TMDB_movie_dataset_v11.csv', 'File 2');


module.exports = processCSV;
