const sql = require('mssql');

const config = {
  user: 'ADMIN',
  password: '123',
  server: 'DESKTOP-UA3NA5I',
  database: 'UnivDb',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

sql.connect(config)
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });
