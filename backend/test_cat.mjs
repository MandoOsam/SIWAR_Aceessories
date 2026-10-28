import {createApp} from './src/app.ts';
import request from 'supertest';
const app = createApp();
const res = await request(app).get('/api/v1/categories');
console.log(res.status);
