const sql = require("mssql/msnodesqlv8");

const config = {
    connectionString: "DSN=Bd9;Trusted_Connection=yes;"
  };

module.exports = { sql, config };
