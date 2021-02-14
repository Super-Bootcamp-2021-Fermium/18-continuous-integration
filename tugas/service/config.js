const rc = require('rc');

const defaultConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'database',
  },
  server: {
    task_port: 80,
    worker_port: 81,
    performance_port: 82,
  },
  minio: {
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  },
};

const config = rc('tm', defaultConfig);

module.exports = {
  config,
};
