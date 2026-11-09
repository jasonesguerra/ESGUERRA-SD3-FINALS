import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';
import { createStore } from './store.js';

describe('CampusCare API', () => {
  let directory;
  let dataPath;
  let app;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'campuscare-test-'));
    dataPath = path.join(directory, 'store.json');
    await writeFile(dataPath, JSON.stringify({
      workOrders: [],
      facilities: [],
      equipment: [],
      staff: [],
      inventory: [],
    }));
    app = createApp({ store: createStore(dataPath) });
  });

  afterEach(async () => rm(directory, { recursive: true, force: true }));

  it('returns a healthy API status', async () => {
    const response = await request(app).get('/api/health').expect(200);
    assert.equal(response.body.status, 'ok');
  });

  it('creates work orders and persists them for later retrieval', async () => {
    const created = await request(app).post('/api/work-orders').send({
      title: 'Repair classroom lights',
      facility: 'Ryan Hall',
      category: 'Electrical',
      priority: 'High',
      floor: 2,
      roomNumber: '04',
    }).expect(201);

    assert.equal(created.body.title, 'Repair classroom lights');
    assert.equal(created.body.floor, 2);
    assert.equal(created.body.roomNumber, '04');
    const listed = await request(app).get('/api/work-orders').expect(200);
    assert.equal(listed.body[0].id, created.body.id);
    const persisted = JSON.parse(await readFile(dataPath, 'utf8'));
    assert.equal(persisted.workOrders.length, 1);
  });

  it('rejects incomplete work order requests', async () => {
    const response = await request(app).post('/api/work-orders').send({ title: 'Repair lights' }).expect(400);
    assert.match(response.body.message, /required/i);
  });

  it('rejects floors and room numbers outside the supported ranges', async () => {
    const response = await request(app).post('/api/work-orders').send({
      title: 'Repair classroom lights',
      facility: 'Ryan Hall',
      category: 'Electrical',
      floor: 4,
      roomNumber: '09',
    }).expect(400);
    assert.match(response.body.message, /floor from 1 to 3/i);
  });

  it('updates a work order and rejects unknown statuses', async () => {
    const created = await request(app).post('/api/work-orders').send({
      title: 'Repair classroom lights',
      facility: 'Ryan Hall',
      category: 'Electrical',
      floor: 1,
      roomNumber: '01',
    }).expect(201);

    const updated = await request(app).patch(`/api/work-orders/${created.body.id}`).send({ status: 'Completed' }).expect(200);
    assert.equal(updated.body.status, 'Completed');
    await request(app).patch(`/api/work-orders/${created.body.id}`).send({ status: 'Waiting' }).expect(400);
  });
});