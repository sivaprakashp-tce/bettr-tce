# Bettr TCE

A web-based complaint management portal for **Thiagarajar College of Engineering (TCE)**. Students and faculty can submit, track, upvote, comment on, and resolve campus complaints through an intuitive interface with AI-powered recommendations. Formerly known as "Complaint Management System - TCE".

## Features

- **Authentication** – Only `@student.tce.edu` (students) and `@tce.edu` (faculty) emails can register. JWT-based auth.
- **Issue Submission** – Post issues with title, description, department, and photos. Duplicate check via vector search before posting.
- **Issue Feed** – Personalized "Issues You May Face" page using k-NN vector search on MongoDB Atlas.
- **Upvoting & Comments** – Upvote issues (no downvotes), comment on issue threads, and view your activity (upvoted and commented issues).
- **Resolution Flow** – Any user can propose a resolution (with photo proof). The original poster must confirm before it's marked resolved.
- **Reporting & Bans** – Report spam users. 30 reports = 30-day ban.
- **Delete Protection** – Random token confirmation required to delete issues.
- **User Dashboard** – Stats overview, pending reviews, recent issues.
- **Edit Profile** – Update name and view account details.
- **Responsive Design** – Built with Tailwind CSS 4. Works on mobile and desktop.
- **Image Storage** – All images stored in MongoDB GridFS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, Framer Motion, React Router |
| **Backend** | Express 5, Mongoose 9, JWT, bcryptjs |
| **Database** | MongoDB Atlas (GridFS for images, Vector Search for k-NN) |
| **Embeddings** | @xenova/transformers (all-MiniLM-L6-v2, runs locally) |

## Project Structure

```
/app
├── backend/               # Express API server
│   ├── config/            # Database connection
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, email validation
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helpers, embedding
│   ├── .env.example       # Environment template
│   └── server.js          # Entry point
├── frontend/              # React SPA
│   ├── src/
│   │   ├── api/           # Fetch client
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context/provider
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # Entry point
│   ├── .env.example
│   └── vite.config.js
├── impl_plan.md           # Detailed implementation plan
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (with Vector Search enabled)

## Setup

### 1. Clone and Install

```bash
# Backend
cd backend
cp .env.example .env   # Edit with your MongoDB URI and secrets
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure Environment

**Backend** `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/complaints
JWT_SECRET=your-random-secret
JWT_EXPIRES_IN=7d
KNN_K=3               # Number of nearest neighbors for feed
KNN_NUM_CANDIDATES=100
SIMILAR_ISSUES_K=5    # Number of similar issues shown before posting
FEED_PAGE_SIZE=20
BAN_THRESHOLD=30      # Reports before auto-ban
BAN_DURATION_DAYS=30
UPLOAD_MAX_SIZE=5242880
```

**Frontend** `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FEED_PAGE_SIZE=20
VITE_BAN_THRESHOLD=30
VITE_COLLEGE_LOGO_URL=/tce-logo.png
VITE_APP_NAME=Bettr TCE
```

### 3. MongoDB Atlas Vector Search Index

For the k-NN recommendations to work, create an Atlas Search index on the `issues` collection:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 384,
        "similarity": "cosine"
      }
    }
  }
}
```

Name the index: `issue_vector_index`

### 4. Run

```bash
# Backend (port 5000)
cd backend
npm start   # or: node server.js

# Frontend (port 5173, dev mode)
cd frontend
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (email validated) |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/issues` | Yes | List issues (paginated) |
| GET | `/api/issues/feed` | Yes | Personalized feed |
| POST | `/api/issues` | Yes | Create issue |
| GET | `/api/issues/:id` | Yes | Single issue |
| PUT | `/api/issues/:id` | Yes | Edit issue (poster only) |
| DELETE | `/api/issues/:id` | Yes | Delete issue (token required) |
| POST | `/api/issues/:id/delete-token` | Yes | Get delete confirmation token |
| POST | `/api/issues/:id/resolve` | Yes | Propose resolution (photo required) |
| POST | `/api/issues/:id/confirm` | Yes | Poster confirms resolution |
| POST | `/api/issues/:id/reject` | Yes | Poster rejects resolution |
| POST | `/api/issues/similar` | Yes | Find similar issues (k-NN) |
| GET | `/api/issues/:id/comments` | Yes | List comments |
| POST | `/api/issues/:id/comments` | Yes | Post comment |
| POST | `/api/issues/:id/upvote` | Yes | Toggle upvote |
| GET | `/api/issues/:id/vote` | Yes | Check if upvoted |
| POST | `/api/reports` | Yes | Report a user |
| GET | `/api/users/me` | Yes | User profile |
| PUT | `/api/users/me` | Yes | Update profile |
| GET | `/api/users/me/stats` | Yes | Dashboard stats |
| GET | `/api/users/me/issues` | Yes | User's issues |
| GET | `/api/users/me/activity` | Yes | User's activity (upvoted + commented issues) |
| POST | `/api/upload` | Yes | Upload image (GridFS) |
| GET | `/api/files/:id` | No | Serve image from GridFS |
| GET | `/api/health` | No | Health check |

## Key Flows

### Registration
1. User enters email ending with `@student.tce.edu` or `@tce.edu`
2. Frontend validates format → Backend validates again
3. Role derived from domain: `student` or `faculty`
4. Password hashed with bcrypt, JWT returned

### Posting an Issue
1. User enters title → system checks 5 similar issues via k-NN vector search
2. If similar issues found → modal warns user
3. User confirms "My issue is different" → full form opens
4. User fills description, department, uploads optional photos
5. Backend generates 384-dim embedding from title using @xenova/transformers
6. Issue saved with embedding for future vector searches

### Resolution
1. Any user clicks "Mark as Resolved" → uploads photo + optional message
2. If resolver = poster → immediately resolved
3. If resolver ≠ poster → status = `pending_review`
4. Poster sees issue in "Pending Your Review" section (high priority)
5. Poster views proof → Confirm (resolved) or Reject (back to open)

### Report → Ban
1. User clicks "Report" on another user's content
2. Backend checks for duplicate reports from same reporter
3. Counts total reports against the user
4. If count >= 30 (configurable) → user banned for 30 days
5. Banned users get 403 on all protected routes

### Delete Confirmation
1. User clicks "Delete" → backend generates random 8-char token
2. Modal displays token → user must type it exactly
3. Token expires in 5 minutes
4. On valid token → issue and its votes deleted

### Issues Feed (k-NN Vector Search)
1. Collects titles from user's posted + upvoted issues
2. Generates embedding from combined titles
3. Runs `$vectorSearch` against issue embeddings in MongoDB Atlas
4. Returns top K nearest unvoted issues not owned by user
5. If results < page size → fills with random issues
6. Implements lazy loading via IntersectionObserver
7. After exhausting recommendations → "Show Random Issues" button