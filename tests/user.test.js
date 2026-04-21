const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Proper constructor mock
jest.mock('../models/users', () => {
  return jest.fn().mockImplementation(() => {
    return {
      save: jest.fn().mockResolvedValue(true)
    };
  });
});

const User = require('../models/users');
const userRoutes = require('../routes/routes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true
}));

app.use('/', userRoutes);

describe('POST /add (User Registration)', () => {

  it('should successfully create a user', async () => {
    const response = await request(app)
      .post('/add')
      .field('name', 'John Doe')
      .field('email', 'john@example.com')
      .field('phone', '1234567890');

    expect(response.statusCode).toBe(302);
  });

  it('should handle missing fields', async () => {
    const response = await request(app)
      .post('/add')
      .field('name', '')
      .field('email', '')
      .field('phone', '');

    expect(response.statusCode).toBe(302);
  });

  it('should handle database error', async () => {
    User.mockImplementationOnce(() => {
      return {
        save: jest.fn().mockRejectedValue(new Error('DB error'))
      };
    });

    const response = await request(app)
      .post('/add')
      .field('name', 'Jane Doe')
      .field('email', 'jane@example.com')
      .field('phone', '1234567890');

    expect(response.statusCode).toBe(302);
  });

});