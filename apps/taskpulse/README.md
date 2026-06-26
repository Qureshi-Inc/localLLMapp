# TaskPulse

A modern, full-stack task management web application built with Next.js, TypeScript, Tailwind CSS, and React. Designed for productivity with a polished UI, robust CRUD operations, and seamless deployment via Docker and Coolify.

## Features

- **Landing Page**: Hero section, feature cards, navigation bar, and footer with responsive layout.
- **Dashboard**: Sidebar, header, statistics cards, recent tasks, and task completion summary.
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete) for tasks.
- **Search & Filtering**: Real-time text search and status-based filtering (Todo, In Progress, Done).
- **Polished UI**: Rounded cards, modern spacing, responsive design, mobile support, and nice typography.
- **Empty & Loading States**: Attractive empty state when no tasks exist, loading indicators during data fetching, and user-friendly error messages.
- **REST API**: Endpoints for GET, POST, PATCH, and DELETE operations on tasks.
- **Data Storage**: Simple JSON file-based persistence.
- **Docker Support**: Production-ready Dockerfile, docker-compose, and .dockerignore.

## Local Setup

To run the application locally for development:

cd apps/taskpulse
npm install
npm run dev

The application will be available at http://localhost:3000.

## Docker Usage

### Local Docker Test

Build and run the application using Docker:

cd apps/taskpulse

docker build -t taskpulse .

docker run -p 3000:3000 taskpulse

The application should then be available at:
http://localhost:3000

### Docker Compose

You can also use Docker Compose to manage the container:

cd apps/taskpulse
docker compose up --build

## Deploying with Coolify

Follow these steps to deploy TaskPulse using Coolify:

1. Creating a new resource in Coolify: Log in to your Coolify dashboard and navigate to the resources section to create a new resource.
2. Connecting the GitHub repository: Select and connect your GitHub repository containing the TaskPulse application.
3. Setting the Base Directory to:
apps/taskpulse
4. Using the Dockerfile deployment method: Select "Dockerfile" as the deployment method in Coolify.
5. Exposing port:
3000
6. Deploying the application: Click deploy and wait for the build and deployment process to complete.

Once deployed, your TaskPulse application will be accessible via the URL provided by Coolify.

## Folder Structure

apps/taskpulse/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tasks/
│   │   │       ├── [id]/route.ts
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── TaskForm.tsx
│   └── lib/
│       └── db.ts
├── public/
├── tests/
│   ├── api/
│   │   └── tasks.test.ts
│   └── components/
│       └── TaskForm.test.tsx
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md

## Tech Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Storage: JSON file persistence
- Deployment: Docker, Coolify