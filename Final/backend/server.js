import express from 'express';
import { createStore } from './store.js';

const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Requested', 'In progress', 'Scheduled', 'Completed'];
const roomNumbers = Array.from({ length: 8 }, (_value, index) => String(index + 1).padStart(2, '0'));

export function createApp({ store = createStore() } = {}) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'ua-campus-maintenance-api' });
  });

  app.get('/api/overview', async (_request, response, next) => {
    try {
      const data = await store.read();
      const openOrders = data.workOrders.filter((order) => order.status !== 'Completed');
      const today = new Date().toISOString().slice(0, 10);
      response.json({
        openOrders: openOrders.length,
        inProgress: data.workOrders.filter((order) => order.status === 'In progress').length,
        overdue: openOrders.filter((order) => order.dueAt < today).length,
        scheduledToday: data.workOrders.filter((order) => order.status === 'Scheduled' && order.dueAt === today).length,
        activeEquipment: data.equipment.filter((item) => item.condition !== 'Out of service').length,
        workOrders: data.workOrders.slice(0, 5),
        facilities: data.facilities,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/work-orders', async (_request, response, next) => {
    try {
      const data = await store.read();
      response.json(data.workOrders);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/work-orders', async (request, response, next) => {
    try {
      const { title, facility, category, floor, roomNumber, priority = 'Medium', assignedTo = 'Unassigned', description = '' } = request.body;
      if (!title?.trim() || !facility?.trim() || !category?.trim() || !floor || !roomNumber) {
        return response.status(400).json({ message: 'Title, facility, category, floor, and room number are required.' });
      }
      if (!priorities.includes(priority)) {
        return response.status(400).json({ message: 'Choose a valid priority.' });
      }
      if (![1, 2, 3].includes(Number(floor)) || !roomNumbers.includes(roomNumber)) {
        return response.status(400).json({ message: 'Choose a floor from 1 to 3 and a room number from 01 to 08.' });
      }

      const data = await store.read();
      const workOrder = {
        id: `WO-${Date.now().toString().slice(-6)}`,
        title: title.trim(),
        facility: facility.trim(),
        category: category.trim(),
        priority,
        status: 'Requested',
        assignedTo,
        floor: Number(floor),
        roomNumber,
        reportedBy: 'Facilities Desk',
        createdAt: new Date().toISOString().slice(0, 10),
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        description: description.trim(),
      };
      data.workOrders.unshift(workOrder);
      await store.write(data);
      return response.status(201).json(workOrder);
    } catch (error) {
      return next(error);
    }
  });

  app.patch('/api/work-orders/:id', async (request, response, next) => {
    try {
      const data = await store.read();
      const workOrder = data.workOrders.find((order) => order.id === request.params.id);
      if (!workOrder) {
        return response.status(404).json({ message: 'Work order not found.' });
      }
      if ('status' in request.body && !statuses.includes(request.body.status)) {
        return response.status(400).json({ message: 'Choose a valid status.' });
      }
      if ('priority' in request.body && !priorities.includes(request.body.priority)) {
        return response.status(400).json({ message: 'Choose a valid priority.' });
      }
      if ('floor' in request.body && ![1, 2, 3].includes(Number(request.body.floor))) {
        return response.status(400).json({ message: 'Choose a floor from 1 to 3.' });
      }
      if ('roomNumber' in request.body && !roomNumbers.includes(request.body.roomNumber)) {
        return response.status(400).json({ message: 'Choose a room number from 01 to 08.' });
      }

      const allowedFields = ['status', 'priority', 'assignedTo', 'dueAt', 'description', 'floor', 'roomNumber'];
      for (const field of allowedFields) {
        if (field in request.body) {
          workOrder[field] = field === 'floor' ? Number(request.body[field]) : request.body[field];
        }
      }
      if (workOrder.status === 'Completed') {
        workOrder.completedAt = new Date().toISOString().slice(0, 10);
      }
      await store.write(data);
      return response.json(workOrder);
    } catch (error) {
      return next(error);
    }
  });

  for (const resource of ['facilities', 'equipment', 'staff', 'inventory']) {
    app.get(`/api/${resource}`, async (_request, response, next) => {
      try {
        const data = await store.read();
        response.json(data[resource]);
      } catch (error) {
        next(error);
      }
    });
  }

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ message: 'Something went wrong while processing the request.' });
  });

  return app;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const port = process.env.PORT || 4000;
  createApp().listen(port, () => console.log(`CampusCare API listening on http://localhost:${port}`));
}