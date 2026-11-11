# WanderWise — Smart Tourism Management System

A full-stack MERN tourism application with Admin and Traveller roles, JWT authentication, MongoDB persistence, destination management, content-based recommendations, itinerary planning, favourites, reviews, analytics and Leaflet/OpenStreetMap.

## Prerequisites
- Node.js 20+ and npm
- MongoDB Atlas account (or local MongoDB)
- VS Code

## 1. Configure MongoDB
Create a MongoDB Atlas cluster, create a database user, allow your development IP in Network Access, and copy the connection string. Replace the username/password and database name.

## 2. Backend setup
```bash
cd smart-tourism/backend
npm install
cp .env.example .env
```
Edit `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`. On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Seed the sample destinations and accounts:
```bash
npm run seed
npm run dev
```
API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

Seeded accounts:
- Admin: `admin@smarttourism.local` / `Admin@12345`
- Traveller: `user@smarttourism.local` / `User@12345`

Change these credentials and the JWT secret before deploying. Running the seed script again resets the seeded application collections.

## 3. Frontend setup
Open a second terminal:
```bash
cd smart-tourism/frontend
npm install
cp .env.example .env
npm run dev
```
Open `http://localhost:5173`. The frontend API URL defaults to `http://localhost:5000/api`.

## Features
### Traveller
- Registration/login and protected traveller workspace
- Search, category filtering and sorting of destinations
- Destination detail pages and reviews
- Preference-based recommendations with score and explanation
- Trip creation with date range, travellers, budget and selected places
- Generated day-wise itinerary, trip list and deletion
- Favourites, profile editing and map markers

### Admin
- Separate role-checked admin access
- Database-backed overview cards and category analytics
- Destination create, edit and delete
- User search, activation/deactivation and deletion
- Trip monitoring and category management

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/places`, `GET /api/places/:id`
- Admin place CRUD: `POST /api/admin/places`, `PUT /api/admin/places/:id`, `DELETE /api/admin/places/:id`
- `GET/POST /api/trips`, `PUT/DELETE /api/trips/:id`
- `GET /api/recommendations`, `PUT /api/users/preferences`
- `GET/POST /api/users/favourites`
- `GET /api/admin/stats`, `GET /api/admin/users`
- `GET/POST /api/categories`

## Deployment
### Backend on Render
1. Push the project to GitHub.
2. Create a Render Web Service with root directory `backend`.
3. Build command: `npm install`; start command: `npm start`.
4. Add `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` as environment variables.
5. Run the seed script once from a local environment configured to the production database, or use Render Shell with `npm run seed`. Do not run the destructive seed script on an existing production database unless you intend to reset the seeded collections.

### Frontend on Vercel
1. Import the same GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Set build command `npm run build`, output directory `dist`.
4. Add `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`.
5. Set the backend `CLIENT_URL` to the deployed Vercel origin and redeploy the backend.

## Security and production notes
- Passwords are hashed with bcryptjs and sessions use signed JWT bearer tokens.
- API routes are protected by role middleware; traveller users cannot call admin endpoints.
- Helmet, CORS, JSON size limits, rate limiting and central error handling are enabled.
- Configure a strong unique JWT secret and rotate seeded passwords before public deployment.
- Restrict MongoDB network access to trusted services. Use HTTPS in production.
- For production, add email verification, password reset, audit logs, pagination, automated tests, image uploads (e.g. Cloudinary), route-distance calculation (OSRM/GraphHopper), and stronger server-side validation/business rules.
- Map markers use the actual latitude/longitude stored in MongoDB. OpenStreetMap tiles are provided by the public tile service and should be used in accordance with its usage policy.
- Trip itinerary assignment distributes the selected destinations sequentially, up to three places per day. Entry-fee estimate is calculated from stored entry fees multiplied by traveller count; transport, food, lodging and live route costs are not included.
- Recommendation score is a transparent content-based heuristic, not a trained machine-learning model. It uses category, interests, budget, preferred location, duration, rating and featured status.
