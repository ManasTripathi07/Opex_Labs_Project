# Production Tracking System

A comprehensive production tracking system for embroidery manufacturing facilities. This system digitizes production tracking, replacing physical notebooks with a web-based platform to calculate worker compensation based on machine output.

## Features

### Core Functionality
- **Lot Management**: Track lots and sub-lots through their complete lifecycle (received → allocated → in_production → completed → dispatched)
- **Machine Assignments**: Assign sub-lots to machines and track production progress
- **Shift Logging**: Record operator shifts with automatic stitch calculations
- **Salary Reports**: Generate operator compensation reports based on production output
- **Daily Production Reports**: View production summaries by machine and design

### Four Specialized User Interfaces

1. **Dashboard (Leadership)**
   - Factory overview with real-time metrics
   - Active machine assignments
   - Daily production summaries
   - Sub-lot status tracking

2. **Inbound UI (Office Staff)**
   - Lot receipt and registration
   - Sub-lot splitting with design assignment
   - Piece count validation

3. **Production UI (Supervisors)**
   - Machine assignment management
   - Progress tracking
   - Salary report generation
   - Sub-lot state management

4. **Shift Entry (Mobile-First for Operators)**
   - Simple, touch-friendly interface
   - Auto-populated previous counter readings
   - Real-time validation
   - Large tap targets for ease of use

## Technology Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- RESTful API architecture
- Complex business logic for stitch calculations

### Frontend
- **React** with React Router
- **Vite** for fast development and building
- **Axios** for API communication
- Responsive design (mobile-first for shift entry)

## Getting Started

### Quick Start

**For detailed step-by-step instructions, especially for Windows + PostgreSQL setup, see [QUICK_START.md](QUICK_START.md).**

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (tested with PostgreSQL 17)
- Git

**Windows Users:** PostgreSQL requires additional PATH configuration. See [QUICK_START.md](QUICK_START.md#21-add-postgresql-to-path-windows) for detailed instructions.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd production-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:

**Linux/Mac:**
```bash
# Create PostgreSQL database
createdb production_tracker

# Update database credentials in backend/.env
# Then run migrations
npm run migrate --workspace=backend
```

**Windows:**
```powershell
# Add PostgreSQL to PATH first (see QUICK_START.md)
# Then connect to PostgreSQL
psql -U postgres -d postgres

# Create database
CREATE DATABASE production_tracker;
\q

# Update database credentials in backend/.env
# Then run migrations
npm run migrate --workspace=backend
```

See [QUICK_START.md](QUICK_START.md#step-2-setup-postgresql-database-5-minutes) for troubleshooting database issues.

4. Start development servers:
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

## Project Structure

```
production-tracker/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          # Database schema
│   │   │   ├── connection.js       # Database connection
│   │   │   └── migrate.js          # Migration script
│   │   ├── models/                 # Data models
│   │   ├── routes/                 # API routes
│   │   ├── services/
│   │   │   └── stitchCalculator.js # Core business logic
│   │   ├── tests/                  # Test files
│   │   └── server.js               # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # API client
│   │   ├── components/             # Shared components
│   │   ├── pages/                  # Page components
│   │   ├── styles/                 # Global styles
│   │   ├── App.jsx                 # App component
│   │   └── main.jsx                # Entry point
│   └── package.json
├── README.md
└── package.json                    # Workspace root
```

## Core Business Logic

### Stitch Calculation Formula

The system calculates total stitches produced in a shift using:

```
total_stitches = current_running - previous_running + (rounds_completed × stitches_per_piece)
```

**Example:**
- Design: 578,293 stitches per piece
- Previous counter: 564,117
- Current reading: 348,963
- Rounds completed: 1
- **Result**: 363,139 total stitches

### Validation Rules

1. **Negative Totals**: Flagged as errors
2. **Excessive Output**: Warnings for >50 piece equivalents per shift
3. **Counter Overflow**: Warnings when counter exceeds design stitch count without documented rounds
4. **Previous Counter**: Auto-populated from last shift; defaults to zero for first entry

### State Transitions

Sub-lots follow strict state progression:
- `received` → `allocated`
- `allocated` → `in_production`
- `in_production` → `completed`
- `completed` → `dispatched`

No backward transitions are permitted.

## API Endpoints

### Master Data
- `GET/POST /api/clients` - Client management
- `GET/POST /api/designs` - Design management
- `GET/POST /api/machines` - Machine management
- `GET/POST /api/operators` - Operator management

### Lot Management
- `GET/POST /api/lots` - Lot operations
- `GET /api/sublots` - Sub-lot listing
- `PUT /api/sublots/:id/state` - State transitions

### Production
- `GET/POST /api/assignments` - Assignment management
- `GET /api/assignments/machine/:machineId/active` - Active assignment lookup
- `PUT /api/assignments/:id/progress` - Update progress

### Shift Logging
- `GET/POST /api/shiftlogs` - Shift log operations
- `GET /api/shiftlogs/previous-running` - Get previous counter reading
- `GET /api/shiftlogs/daily-production` - Daily production report
- `GET /api/shiftlogs/salary-report/:operatorId` - Salary report

## Testing

Run tests for the backend:
```bash
npm test --workspace=backend
```

## Deployment

### Production Build

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build --workspace=frontend
npm run build --workspace=backend
```

### Environment Variables

Backend (.env):
```
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_tracker
DB_USER=postgres
DB_PASSWORD=your_password
CORS_ORIGIN=https://your-domain.com
```

## Key Features Implementation

### Auto-populated Previous Counter
The system automatically fetches the last counter reading for the same machine and design, ensuring data integrity in the stitch calculation chain.

### Concurrent Shift Handling
Multiple machines can log shifts simultaneously. The system maintains separate counter chains per machine-design combination.

### Data Integrity
- Sub-lot pieces must sum to lot total pieces
- State transitions are validated and audited
- Previous-running chain integrity is critical for accurate salary calculations

### Performance Considerations
- Database indexes on frequently queried fields
- Efficient joins for reporting queries
- Sub-2-second target for page loads

## Mobile Optimization

The Shift Entry interface is optimized for low-end mobile devices:
- Large touch targets (minimum 44px)
- Minimal text input
- Clear visual feedback
- Pre-filled form data
- Simple, focused UI

## Contributing

This is a trial project. For questions or issues, contact the project maintainer.

## License

Proprietary - All rights reserved
