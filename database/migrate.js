const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const config = {
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
  database: process.env.SNOWFLAKE_DATABASE || 'PLACES_DB',
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
};

async function runMigrations() {
  const connection = snowflake.createConnection(config);
  
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          console.error('Failed to connect to Snowflake:', err);
          reject(err);
        } else {
          console.log('Successfully connected to Snowflake');
          resolve(conn);
        }
      });
    });

    // Read and execute schema files
    const schemaDir = path.join(__dirname, 'schemas');
    const schemaFiles = fs.readdirSync(schemaDir).filter(file => file.endsWith('.sql'));
    
    for (const file of schemaFiles) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(path.join(schemaDir, file), 'utf8');
      
      await new Promise((resolve, reject) => {
        connection.execute({
          sqlText: sql,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error(`Error executing ${file}:`, err);
              reject(err);
            } else {
              console.log(`Successfully executed ${file}`);
              resolve(rows);
            }
          },
        });
      });
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    connection.destroy();
  }
}

runMigrations();





