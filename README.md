# Canvas LMS Dashboard

A role-based dashboard application for Canvas LMS built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Student Dashboard**: View courses, assignments, grades, and upcoming deadlines
- **Teacher Dashboard**: Gradebook, student analytics, and course management
- **Advisor Dashboard**: Student roster, academic progress tracking, and risk alerts
- **Role-based Access Control**: Different views and permissions based on user role

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Canvas LMS instance with API access

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your Canvas API credentials:

```env
NEXT_PUBLIC_CANVAS_API_URL=http://canvas.docker
CANVAS_API_KEY=your_canvas_api_key_here
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
margati-lms-dashboard/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── student/         # Student dashboard
│   │   ├── teacher/         # Teacher dashboard
│   │   └── advisor/         # Advisor dashboard
│   ├── api/                 # API routes
│   │   └── canvas/          # Canvas API proxy
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── canvas/             # Canvas-specific components
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── canvas/             # Canvas API client
│   ├── hooks/              # React hooks
│   └── auth/               # Authentication utilities
└── types/
    └── canvas.ts           # TypeScript type definitions
```

## Canvas API Integration

The dashboard connects to Canvas LMS via the Canvas REST API. The API client is located in `lib/canvas/api.ts` and provides methods for:

- Fetching user courses
- Getting assignments and submissions
- Retrieving grades and enrollments
- Accessing course modules and content

## Role Detection

User roles are automatically detected based on Canvas enrollments:

- **Student**: Has `StudentEnrollment` type
- **Teacher**: Has `TeacherEnrollment` or `TaEnrollment` type
- **Advisor**: Has `ObserverEnrollment` type
- **Admin**: System administrator (to be implemented)

## Features by Role

### Student Dashboard
- My Courses with progress tracking
- Upcoming Assignments timeline
- Grades overview
- Course calendar
- Quick stats (GPA, completion rate)

### Teacher Dashboard
- My Courses (courses taught)
- Gradebook with all students
- Assignment analytics
- Student performance tracking
- At-risk student alerts

### Advisor Dashboard
- Student roster
- Academic progress tracking
- Risk alerts for struggling students
- Course recommendations
- Report generation

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CANVAS_API_URL` | Canvas instance URL | Yes |
| `CANVAS_API_KEY` | Canvas API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js project setup
- [x] Canvas API integration
- [x] Basic dashboard layout
- [x] TypeScript types

### Phase 2: Student Dashboard (In Progress)
- [x] Course listing
- [ ] Assignment timeline
- [ ] Grades overview
- [ ] Calendar view
- [ ] Quick stats

### Phase 3: Teacher Dashboard
- [ ] Gradebook interface
- [ ] Assignment analytics
- [ ] Student performance tracking
- [ ] At-risk student alerts

### Phase 4: Advisor Dashboard
- [ ] Student roster
- [ ] Academic progress tracking
- [ ] Risk alerts system
- [ ] Report generation

### Phase 5: Polish
- [ ] Authentication flow
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

