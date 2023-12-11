const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { startServer, stopServer } = require('../utils/mongoConfigTesting');
const { fakeUserData, fakeLoginData } = require('./fixtures');
const { user } = require('../routes');
require('../config/passport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', user);

beforeAll(async () => startServer());
afterAll(async () => stopServer());

describe('/user/sign-up Route', () => {
  test('Valid User Signup works', (done) => {
    request(app).post('/user/sign-up').send(fakeUserData).expect(201, done);
  });

  test('Invalid email doesnt work', (done) => {
    request(app)
      .post('/user/sign-up')
      .send({
        firstName: 'Tobias',
        lastName: 'Stonehagen',
        email: 'fakeuser.com',
        password: '12345678',
      })
      .expect((res) => {
        expect(res.body).toHaveProperty('errors');
      })
      .expect(400, done);
  });

  test('Invalid password doesnt work', (done) => {
    request(app)
      .post('/user/sign-up')
      .send({
        firstName: 'Tobias',
        lastName: 'Stonehagen',
        email: 'fake@user.com',
        password: 'abcdefgf',
      })
      .expect((res) => {
        expect(res.body).toHaveProperty('errors');
      })
      .expect(400, done);
  });

  test('Invalid name doesnt work', (done) => {
    request(app)
      .post('/user/sign-up')
      .send({
        firstName: 'Tobias',
        lastName: 'S',
        email: 'fake@user.com',
        password: '12345678',
      })
      .expect((res) => {
        expect(res.body).toHaveProperty('errors');
      })
      .expect(400, done);
  });
});

describe('/user/log-in Route', () => {
  test('User LogIn Route works', (done) => {
    request(app)
      .post('/user/sign-up')
      .send(fakeUserData)
      .then(() => {
        request(app)
          .post('/user/log-in')
          .send(fakeLoginData)
          .expect((res) => {
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
          })
          .expect(200, done);
      });
  });

  test('Invalid email doesnt works', (done) => {
    request(app)
      .post('/user/sign-up')
      .send(fakeUserData)
      .then(() => {
        request(app)
          .post('/user/log-in')
          .send({
            email: 'fake2@user.com',
            password: '12345678',
          })
          .expect((res) => {
            expect(res.body).toHaveProperty('errors');
          })
          .expect(401, done);
      });
  });

  test('Invalid password doesnt works', (done) => {
    request(app)
      .post('/user/sign-up')
      .send(fakeUserData)
      .then(() => {
        request(app)
          .post('/user/log-in')
          .send({
            email: 'fake@user.com',
            password: 'wrongpassword',
          })
          .expect((res) => {
            expect(res.body).toHaveProperty('errors');
          })
          .expect(401, done);
      });
  });
});
