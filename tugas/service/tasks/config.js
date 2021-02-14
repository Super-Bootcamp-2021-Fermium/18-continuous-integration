const rc = require('rc');

const defaultConfig = {
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'sanbercode2',
  },
  server: {
    port: 7002,
  },
  minio: {
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  }
};

const config = rc('database', defaultConfig);
const configs = rc('minio', defaultConfig);

module.exports = {
  config,
  configs,
};
