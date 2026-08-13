# Architecture Documentation

## System Overview

The Production Tracking System is a full-stack web application built with a clean separation between frontend and backend components, connected via a RESTful API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Inbound  │  │Production│  │  Shift   │   │
│  │    UI    │  │    UI    │  │    UI    │  │  Entry   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └────────────┬─────────────┬──────────────┘           │
│                    │  API Client │                           │
│                    └──────┬──────┘                           │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/REST
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                        Backend (Node.js/Express)              │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────┐         │
│  │              API Routes Layer                    │         │
│  │  /clients  /designs  /machines  /operators      │         │
│  │  /lots  /sublots  /assignments  /shiftlogs      │         │
│  └────────────────────┬─────────────────────────────┘        │
│                       │                                       │
│  ┌────────────────────┴─────────────────────────────┐        │
│  │              Business Logic Layer                 │        │
│  │  - StitchCalculator (core calculation logic)     │        │
│  │  - State transition validation                    │        │
│  │  - Previous counter auto-population               │        │
│  └────────────────────┬─────────────────────────────┘        │
│                       │                                       │
│  ┌────────────────────┴─────────────────────────────┐        │
│  │              Data Access Layer (Models)           │        │
│  │  Client  Design  Machine  Operator  Lot          │        │
│  │  SubLot  Assignment  ShiftLog                     │        │
│  └────────────────────┬─────────────────────────────┘        │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        │ SQL Queries
                        │
┌───────────────────────┼───────────────────────────────────────┐
│                  PostgreSQL Database                          │
│  Tables: clients, designs, machines, operators, lots,         │
│          sub_lots, assignments, shift_logs, etc.              │
└───────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layer Separation

1. **Routes Layer** (`src/routes/`)
   - HTTP endpoint definitions
   - Request validation
   - Response formatting
   - Error handling

2. **Business Logic Layer** (`src/services/`)
   - Core business rules
   - Complex calculations (StitchCalculator)
   - Cross-entity operations

3. **Data Access Layer** (`src/models/`)
   - Database queries
   - Transaction management
   - Data transformation

### Key Design Patterns

#### Repository Pattern
Each model encapsulates database operations for its entity:
```javascript
class Client {
  static async findAll(searchTerm)
  static async findById(id)
  static async create(data)
  static async update(id, data)
  static async delete(id)
}
```

#### Service Layer Pattern
Complex business logic is isolated in service classes:
```javascript
class StitchCalculator {
  static calculate(params)
  static validate(params)
}
```

#### Transaction Management
Critical operations use database transactions:
```javascript
const client = await getClient();
try {
  await client.query('BEGIN');
  // Multiple operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Database Schema

### Entity Relationships

```
clients ─┐
         ├─→ lots ─→ sub_lots ─┬─→ assignments ─→ shift_logs
         │                     │
designs ─┴───────────────────┬─┘
                             │
machines ─→ machine_design_rotations
         └─→ assignments
                             
operators ─→ shift_logs
```

### Key Tables

1. **clients**: Customer information
2. **designs**: Embroidery design specifications
3. **machines**: Production machines
4. **machine_design_rotations**: Pieces per round for each machine-design combo
5. **operators**: Machine operators
6. **lots**: Incoming production lots
7. **sub_lots**: Split portions with state tracking
8. **assignments**: Machine-sublot allocations
9. **shift_logs**: Production output records
10. **sub_lot_state_transitions**: Audit trail for state changes

### Indexes

Strategic indexes for query performance:
- Foreign keys (automatic)
- Search fields (name, identifier)
- Filter fields (state, date ranges)
- Composite indexes (machine_id + shift_date + shift_type)

## Frontend Architecture

### Component Structure

```
src/
├── api/
│   └── client.js           # Centralized API client
├── components/
│   └── Layout.jsx          # Shared layout with navigation
├── pages/
│   ├── Dashboard.jsx       # Factory overview
│   ├── InboundUI.jsx       # Lot receipt
│   ├── ProductionUI.jsx    # Assignment management
│   ├── ShiftEntry.jsx      # Mobile-first logging
│   └── MasterData.jsx      # Master data management
├── styles/
│   └── global.css          # Shared styles and design system
├── App.jsx                 # Router configuration
└── main.jsx                # Application entry point
```

### State Management

- Component-level state with React hooks
- No global state management (not needed for this scale)
- API calls trigger re-fetches to ensure fresh data

### Routing

React Router provides navigation:
- `/dashboard` - Factory overview
- `/inbound` - Lot receipt interface
- `/production` - Production management
- `/master-data` - Master data CRUD
- `/shift/:machineId` - Mobile shift entry (no layout wrapper)

## API Design

### RESTful Principles

- Resource-based URLs (`/api/clients`, `/api/machines`)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Appropriate status codes (200, 201, 400, 404, 500)
- JSON request/response bodies

### Special Endpoints

#### Previous Running Stitches
```
GET /api/shiftlogs/previous-running?machineId=1&designId=2&beforeDate=2024-01-15&beforeShiftType=afternoon
```
Returns the last counter reading for auto-population.

#### Daily Production Report
```
GET /api/shiftlogs/daily-production?date=2024-01-15
```
Aggregates production by machine and design.

#### Salary Report
```
GET /api/shiftlogs/salary-report/:operatorId?fromDate=2024-01-01&toDate=2024-01-31
```
Calculates compensation based on stitches and rates.

## Critical Business Logic

### Stitch Calculation

Location: `backend/src/services/stitchCalculator.js`

The core formula:
```
total_stitches = current_running - previous_running + (rounds_completed × stitches_per_piece)
```

Handles:
- First shift (previous = 0)
- Counter rollover via rounds
- Validation errors
- Warning conditions

### State Transitions

Location: `backend/src/models/SubLot.js`

Enforces valid progressions:
```javascript
const STATE_TRANSITIONS = {
  received: ['allocated'],
  allocated: ['in_production'],
  in_production: ['completed'],
  completed: ['dispatched'],
  dispatched: [],
};
```

Creates audit trail in `sub_lot_state_transitions` table.

### Auto-populated Previous Counter

Location: `backend/src/models/ShiftLog.js`

Queries the most recent shift log for the same machine-design combination, respecting date and shift order (morning < afternoon < night).

## Concurrency Handling

### Same Machine
- Single active assignment per machine enforced at application level
- Database constraint prevents conflicts

### Different Machines
- Independent counter chains
- No locking required
- Parallel shift logging supported

### Data Integrity
- Transactions for multi-step operations
- Foreign key constraints
- Check constraints for business rules

## Performance Considerations

### Database Optimization
- Proper indexing strategy
- Efficient joins in queries
- Query result limiting

### Frontend Optimization
- Component-level code splitting
- Minimal re-renders
- Lazy loading for routes

### API Response Times
- Target: <2 seconds for all endpoints
- Achieved through indexed queries and simple aggregations

## Security Considerations

### Current Implementation
- CORS configuration
- Input validation
- SQL injection prevention (parameterized queries)

### Out of Scope (Phase 2)
- Authentication/authorization
- Role-based access control
- API rate limiting
- HTTPS enforcement

## Mobile Optimization

### Shift Entry Interface
- Touch-first design
- Large tap targets (44px minimum)
- Reduced cognitive load
- Pre-filled data where possible
- Clear success/error feedback
- Works on low-end devices

### Responsive Design
- Mobile-first CSS
- Flexible grid layouts
- Breakpoints at 768px for tablet/desktop

## Testing Strategy

### Unit Tests
- StitchCalculator logic
- Model methods
- Utility functions

### Integration Tests
- API endpoint flows
- Database operations
- State transitions

### Manual Testing Checklist
- All four UI workflows
- Mobile shift entry on device
- Report generation
- Error conditions

## Deployment Architecture

### Production Setup

```
┌─────────────────┐
│   Nginx/Caddy   │  (Reverse proxy, static files)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴────┐ ┌─┴──────┐
│Frontend│ │Backend │  (Node.js process)
│ (dist) │ │ :3000  │
└────────┘ └────┬───┘
                │
         ┌──────┴──────┐
         │ PostgreSQL  │
         │   Database  │
         └─────────────┘
```

### Process Management
- systemd or PM2 for Node.js process
- Automatic restart on failure
- Log rotation

### Database
- PostgreSQL with proper configuration
- Regular backups
- Connection pooling (pg Pool)

## Future Enhancements

### Authentication
- User login system
- Role-based access control
- Session management

### Advanced Features
- QR code generation for machine URLs
- WhatsApp integration for notifications
- Photo/OCR for counter readings
- Advanced analytics and reporting

### Performance
- Redis caching layer
- Database read replicas
- CDN for static assets

## Monitoring & Maintenance

### Health Checks
- `/health` endpoint for uptime monitoring
- Database connection validation

### Logging
- Request logging (development)
- Error logging (all environments)
- Audit trail (state transitions)

### Maintenance Tasks
- Regular database backups
- Log rotation
- Performance monitoring
- Security updates
