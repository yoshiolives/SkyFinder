import snowflake from 'snowflake-sdk';

interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  warehouse: string;
  database: string;
  schema: string;
}

const config: SnowflakeConfig = {
  account: process.env.SNOWFLAKE_ACCOUNT || '',
  username: process.env.SNOWFLAKE_USERNAME || '',
  password: process.env.SNOWFLAKE_PASSWORD || '',
  warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
  database: process.env.SNOWFLAKE_DATABASE || 'PLACES_DB',
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
};

let connection: any = null;

export const getConnection = async () => {
  if (!connection) {
    try {
      connection = snowflake.createConnection(config);
      await new Promise((resolve, reject) => {
        connection.connect((err: any, conn: any) => {
          if (err) {
            console.error('Failed to connect to Snowflake:', err);
            reject(err);
          } else {
            console.log('Successfully connected to Snowflake');
            resolve(conn);
          }
        });
      });
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
  return connection;
};

export const initializeDatabase = async () => {
  const conn = await getConnection();
  
  // Create tables if they don't exist
  const createTables = `
    -- Places table
    CREATE TABLE IF NOT EXISTS places (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      category VARCHAR(100),
      rating FLOAT,
      price_level INTEGER,
      photos ARRAY,
      address VARCHAR(500),
      phone VARCHAR(50),
      website VARCHAR(500),
      opening_hours ARRAY,
      created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
      updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
    );

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      preferences VARIANT,
      created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
      updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
    );

    -- Recommendations table
    CREATE TABLE IF NOT EXISTS recommendations (
      id VARCHAR(36) PRIMARY KEY,
      place_id VARCHAR(36) REFERENCES places(id),
      user_id VARCHAR(36) REFERENCES users(id),
      reason TEXT,
      confidence FLOAT,
      created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
    );

    -- User interactions table
    CREATE TABLE IF NOT EXISTS user_interactions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) REFERENCES users(id),
      place_id VARCHAR(36) REFERENCES places(id),
      interaction_type VARCHAR(50), -- 'view', 'like', 'dislike', 'visit'
      created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
    );
  `;

  try {
    await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: createTables,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) {
            console.error('Error creating tables:', err);
            reject(err);
          } else {
            console.log('Tables created successfully');
            resolve(rows);
          }
        },
      });
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const closeConnection = () => {
  if (connection) {
    connection.destroy();
    connection = null;
  }
};





