import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  dbName: process.env.DB_NAME || 'default_db_name',
  dbUser: process.env.DB_USER || 'default_db_user',
  dbPass: process.env.DB_PASS || 'default_db_pass',
  dbHost: process.env.DB_HOST || 'localhost',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
};

export default config;
