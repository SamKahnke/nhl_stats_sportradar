import postgresql from 'pg';
import os from 'os';

const { Pool } = postgresql;
const config = require('config');

export default (callback = null) => {
  // NOTE: PostgreSQL creates a superuser by default on localhost using the OS username.
  const pool = new Pool({
    user: process.env.NODE_ENV === 'development' && (os.userInfo() || {}).username || '',
    database: config.get('database.database'),
    password: '',
    host: '127.0.0.1',
    port: 5000,
  });

  const connection = {
    pool,
    query: (...args) => {
      return pool.connect().then((client) => {
        return client.query(...args).then((res) => {
          client.release();
          return res.rows;
        });
      });
    },
  };

  process.postgresql = connection;

  if (callback) {
    callback(connection);
  }

  return connection;
};