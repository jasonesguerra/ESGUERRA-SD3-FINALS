# CampusCare

University of the Assumption facility and equipment maintenance management system. This initial implementation follows the project brief's goal: a locally runnable frontend and backend, multiple working UI sections, data models, API routes, and a live frontend-to-backend interaction for demonstration.

## Technology

- Frontend: React 18, Vite, JavaScript
- Backend: Node.js and Express
- Demo persistence: local JSON data store at `backend/data/store.json`
- Icons: Lucide

The JSON store keeps the project easy to run for an initial class demonstration. It is suitable for a single local development process, not concurrent production use.

## Run locally

Requirements: Node.js 18 or newer and npm.

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`. The Express API runs at `http://localhost:4000`; Vite proxies `/api` requests to it. Check `http://localhost:4000/api/health` to confirm the backend is available.

Useful commands:

```powershell
npm test
npm run build
npm start
```

`npm start` starts the API only. Use `npm run dev` for the integrated frontend and backend demonstration.

## Implemented sections

- Overview: live work-order and equipment counts, recent requests, priority attention, and facility status.
- Work orders: search, status and priority filters, create a request with facility, floor (1–3), and room (01–08), and update a request's status.
- Facilities: campus building directory and open-order counts.
- Equipment: asset register, condition, location, and next service date.
- Maintenance team: on-duty technicians and active assignment counts.
- Parts inventory: quantity on hand and reorder thresholds.

The UA logo supplied with the project is displayed in the application sidebar. Demo records are preloaded and new work orders and status changes persist in `backend/data/store.json`.

## API routes

- `GET /api/health`
- `GET /api/overview`
- `GET /api/work-orders`
- `POST /api/work-orders`
- `PATCH /api/work-orders/:id`
- `GET /api/facilities`
- `GET /api/equipment`
- `GET /api/staff`
- `GET /api/inventory`

## Project structure

```text
backend/
  data/store.json      Seed data and local persistence
  server.js            Express API and application factory
  server.test.js       API tests
  store.js             JSON store adapter
frontend/
  public/ua-logo.png   University logo
  src/App.jsx          Dashboard and management views
  src/main.jsx         React entry point
  src/styles.css       Responsive interface styles
  index.html           Vite document
```

## Suggested next steps

- Add sign-in and role-based permissions for requesters, technicians, and administrators.
- Move the demo JSON store to a shared database such as PostgreSQL or MySQL when multiple users need to work at once.
- Add assignment controls, preventive-maintenance schedules, attachments, and work-order history.
- Replace sample campus records with verified facility, asset, staff, and inventory data.