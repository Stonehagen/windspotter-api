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
        username: 'fakeuser',
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
        username: 'fakeuser',
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
        username: 'f',
        email: 'fake@user.com',
        password: '12345678',
      })
      .expect((res) => {
        expect(res.body).toHaveProperty('errors');
      })
      .expect(400, done);
  });
});
