/* eslint-disable no-undef */
/* eslint-disable no-undef */
const { connect } = require('../lib/orm');
const orm = require('../lib/orm');
const storage = require('../lib/storage');
const bus = require('../lib/bus');
const taskServer = require('../tasks/server');
const FormData = require('form-data');
const fs = require('fs');
const http = require('http');
const { TaskSchema } = require('../tasks/task.model');
const { WorkerSchema } = require('../worker/worker.model');
const { config } = require('../tasks/config');
const server = require('../tasks/server');
const fetch = require('node-fetch');
const { truncate } = require('../tasks/task');
const nock = require('nock');

function request(options, form = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      if (res.statusCode === 404) {
        reject(ERROR_TASK_NOT_FOUND);
      }
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        resolve(data);
      });
      res.on('error', (err) => {
        reject((err && err.message) || err.toString());
      });
    });
    req.on('error', (error) => {
      console.error(error);
    });
    if (form) {
      form.pipe(req);
      req.on('response', function (res) {
        console.log(res.statusCode);
      });
    } else {
      req.end();
    }
  });
}

describe('task', () => {
  let connection;
  beforeAll(async () => {
    try {
      connection = await orm.connect([WorkerSchema, TaskSchema], {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'sanbercode2',
      });
    } catch (err) {
      console.error('database connection failed');
    }
    try {
      await storage.connect('task-manager', {
        endPoint: '127.0.0.1',
        port: 9000,
        useSSL: false,
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
      });
    } catch (err) {
      console.error('object storage connection failed');
    }
    try {
      await bus.connect();
    } catch (err) {
      console.error('message bus connection failed');
    }
    taskServer.run();
  });
  beforeEach(async () => {
    //await truncate();
    await nock('http://localhost:7001/list')
  });

  afterAll(async () => {
    await truncate();
    await connection.close();
    bus.close();
    taskServer.stop();
  });

  describe('tasks', () => {
    it('get list tasks before added', async () => {
      const options = {
        hostname: 'localhost',
        port: 7002,
        path: '/list',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await request(options);
      const data = JSON.parse(response);
      expect(data).toHaveLength(0);
    });

     it('add new task', async () => {
      const taskForm = new FormData();
      taskForm.append('name', 'user');
      taskForm.append('age', 29);
      taskForm.append('bio', 'test');
      taskForm.append('address', 'jkt');
      taskForm.append('photo', fs.createReadStream('assets/nats.png'));

      const response = await new Promise((resolve, reject) => {

      nock('http://localhost:7001').post('/register', 
      taskForm.submit('http://localhost:7001/register',
      function (err, res) {
          if (err) {
            reject(err);
          }
          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
          });
          res.on('end', () => {
            resolve(data);
          });
        }
      )
      ).reply(200);
      });

      const dataWorker = JSON.parse(response);
      expect(dataWorker.name).toBe('user');
      
      nock('http://localhost:7001').get(`/info?id=${dataWorker.id}`).reply(200)
      const form = new FormData();
      form.append('job', 'menonton');
      form.append('assignee_id', dataWorker.id);
      form.append('attachment', fs.createReadStream('assets/nats.png'));

      const taskResponse = await new Promise((resolve, reject) => {
        form.submit('http://localhost:7002/add', function (err, res) {
          if (err) {
            reject(err);
          }
          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
          });
          res.on('end', () => {
            resolve(data);
          });
        });
      });
      const data = JSON.parse(taskResponse);
      expect(data.job).toBe('menonton');
    })

    it('get list tasks after added', async () => {
      const options = {
        hostname: 'localhost',
        port: 7002,
        path: '/list',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await request(options);
      const data = JSON.parse(response);
      expect(data).toHaveLength(1);
    });

    it('done task', async () => {
      const options = {
        hostname: 'localhost',
        port: 7002,
        path: '/list',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await request(options);
      const data = JSON.parse(response);
      expect(data).toHaveLength(1);
      
      const res = await fetch(`http://localhost:7002/done?id=${data[0].id}`, {
        method: 'put',
        headers: { 'Content-type': 'application/json' },
      });
      const doneResponse = await res.json();
      expect(doneResponse.done).toBeTruthy();
    });

   

  });
});