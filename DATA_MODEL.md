# Data Model Documentation

## Entity Relationship Diagram

```
┌─────────────┐
│   clients   │
│─────────────│
│ id          │─────┐
│ name        │     │
│ phone       │     │
└─────────────┘     │
                    │
                    │ 1:N
                    ▼
              ┌─────────────┐
              │    lots     │
              │─────────────│
              │ id          │─────┐
              │ lot_number  │     │
              │ client_id   │     │
              │ total_pieces│     │
              │ received_date│    │
              └─────────────┘     │
                                  │
                                  │ 1:N
                                  ▼
┌─────────────┐            ┌──────────────┐           ┌──────────────┐
│   designs   │            │  sub_lots    │           │  machines    │
│─────────────│            │──────────────│           │──────────────│
│ id          │───┐        │ id           │     ┌────│ id           │
│ identifier  │   │        │ lot_id       │     │    │ identifier   │
│ stitches_   │   │        │ sub_lot_     │     │    │ name         │
│  per_piece  │   │        │  number      │     │    └──────────────┘
│ rate_per_   │   │        │ design_id    │─────┘           │
│  stitch     │   │        │ piece_count  │                 │
└─────────────┘   │        │ state        │                 │
      │           │        └──────────────┘                 │
      │           │               │                         │
      │           │               │ 1:N                     │
      │           │               ▼                         │
      │           │        ┌──────────────┐                 │
      │           │        │ assignments  │                 │
      │           │        │──────────────│                 │
      │           │        │ id           │                 │
      │           └───────│ design_id    │                 │
      │                    │ machine_id   │────────────────┘
      │                    │ sub_lot_id   │
      │                    │ pieces_issued│
      │                    │ pieces_      │
      │                    │  completed   │
      │                    │ status       │
      │                    └──────────────┘
      │                           │
      │                           │ 1:N
      │                           ▼
      │    ┌──────────────┐ ┌──────────────┐
      │    │  operators   │ │  shift_logs  │
      │    │──────────────│ │──────────────│
      │    │ id           │─│ id           │
      │    │ name         │ │ machine_id   │
      │    │ phone        │ │ operator_id  │
      │    └──────────────┘ │ design_id    │─────────────┘
      │                     │ assignment_id│
      │                     │ shift_date   │
      │                     │ shift_type   │
      │                     │ previous_    │
      │                     │  running_    │
      │                     │  stitches    │
      │                     │ current_     │
      │                     │  running_    │
      │                     │  stitches    │
      │                     │ rounds_      │
      │                     │  completed   │
      │                     │ total_       │
      │                     │  stitches    │
      │                     │ piece_       │
      │                     │  equivalents │
      │                     │ has_warning  │
      │                     │ has_error    │
      │                     └──────────────┘
      │                            
      │                     ┌───────────────────────┐
      │                     │ machine_design_       │
      │                     │  rotations            │
      └────────────────────│───────────────────────│
                            │ id                    │
                            │ machine_id            │
                            │ design_id             │
                            │ pieces_per_round      │
                            └───────────────────────┘

                            ┌───────────────────────┐
                            │ sub_lot_state_        │
                            │  transitions          │
                            │───────────────────────│
                            │ id                    │
                            │ sub_lot_id            │
                            │ from_state            │
                            │ to_state              │
                            │ transitioned_at       │
                            └───────────────────────┘
```

## Tables

### Core Entities

#### clients
Customer organizations that order embroidery work.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Client name |
| phone | VARCHAR(20) | | Contact phone |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_clients_name` on `name`

---

#### designs
Embroidery design specifications with stitch counts and rates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| identifier | VARCHAR(100) | UNIQUE, NOT NULL | Design code |
| stitches_per_piece | INTEGER | NOT NULL, >0 | Stitches in one piece |
| rate_per_stitch | DECIMAL(10,4) | | Payment rate (mutable) |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_designs_identifier` on `identifier`

---

#### machines
Production machines that execute embroidery work.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| identifier | VARCHAR(100) | UNIQUE, NOT NULL | Machine code |
| name | VARCHAR(255) | NOT NULL | Machine name/model |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_machines_identifier` on `identifier`

---

#### machine_design_rotations
Defines how many pieces each machine produces per rotation for each design.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| machine_id | INTEGER | FK→machines, NOT NULL | Machine reference |
| design_id | INTEGER | FK→designs, NOT NULL | Design reference |
| pieces_per_round | INTEGER | NOT NULL, >0 | Pieces per rotation |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Constraints:**
- UNIQUE(machine_id, design_id)

---

#### operators
Machine operators who work shifts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Operator name |
| phone | VARCHAR(20) | | Contact phone |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_operators_name` on `name`

---

### Lot Management

#### lots
Incoming production orders from clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| lot_number | VARCHAR(100) | UNIQUE, NOT NULL | Lot identifier |
| client_id | INTEGER | FK→clients, NOT NULL | Client reference |
| total_pieces | INTEGER | NOT NULL, >0 | Total pieces in lot |
| received_date | DATE | NOT NULL | Receipt date |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_lots_lot_number` on `lot_number`
- `idx_lots_client_id` on `client_id`

---

#### sub_lots
Split portions of lots assigned to specific designs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| lot_id | INTEGER | FK→lots, NOT NULL, CASCADE | Lot reference |
| sub_lot_number | VARCHAR(100) | UNIQUE, NOT NULL | Sub-lot identifier |
| design_id | INTEGER | FK→designs, NOT NULL | Design reference |
| piece_count | INTEGER | NOT NULL, >0 | Pieces in sub-lot |
| state | VARCHAR(50) | NOT NULL, CHECK | Current state |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**States:** `received`, `allocated`, `in_production`, `completed`, `dispatched`

**Indexes:**
- `idx_sub_lots_lot_id` on `lot_id`
- `idx_sub_lots_state` on `state`
- `idx_sub_lots_design_id` on `design_id`

---

#### sub_lot_state_transitions
Audit trail for sub-lot state changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| sub_lot_id | INTEGER | FK→sub_lots, CASCADE | Sub-lot reference |
| from_state | VARCHAR(50) | | Previous state |
| to_state | VARCHAR(50) | NOT NULL | New state |
| transitioned_at | TIMESTAMP | DEFAULT NOW() | Transition time |

---

### Production

#### assignments
Machine-sublot allocations for production.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| machine_id | INTEGER | FK→machines, NOT NULL | Machine reference |
| sub_lot_id | INTEGER | FK→sub_lots, NOT NULL | Sub-lot reference |
| pieces_issued | INTEGER | NOT NULL, >0 | Pieces assigned |
| pieces_completed | INTEGER | DEFAULT 0, ≥0 | Pieces finished |
| status | VARCHAR(50) | NOT NULL, CHECK | Assignment status |
| assigned_at | TIMESTAMP | DEFAULT NOW() | Assignment time |
| completed_at | TIMESTAMP | | Completion time |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Status:** `active`, `completed`

**Business Rules:**
- Only one active assignment per machine at a time
- pieces_completed ≤ pieces_issued
- Auto-completes when pieces_completed = pieces_issued

**Indexes:**
- `idx_assignments_machine_id` on `machine_id`
- `idx_assignments_sub_lot_id` on `sub_lot_id`
- `idx_assignments_status` on `status`

---

#### shift_logs
Records of operator shifts with production output.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| machine_id | INTEGER | FK→machines, NOT NULL | Machine reference |
| operator_id | INTEGER | FK→operators, NOT NULL | Operator reference |
| design_id | INTEGER | FK→designs, NOT NULL | Design reference |
| assignment_id | INTEGER | FK→assignments | Assignment reference |
| shift_date | DATE | NOT NULL | Shift date |
| shift_type | VARCHAR(20) | NOT NULL, CHECK | Shift period |
| previous_running_stitches | INTEGER | NOT NULL, ≥0, DEFAULT 0 | Previous counter |
| current_running_stitches | INTEGER | NOT NULL, ≥0 | Current counter |
| rounds_completed | INTEGER | NOT NULL, ≥0, DEFAULT 0 | Full rotations |
| total_stitches | INTEGER | NOT NULL | Calculated stitches |
| piece_equivalents | DECIMAL(10,2) | | Calculated pieces |
| has_warning | BOOLEAN | DEFAULT FALSE | Warning flag |
| has_error | BOOLEAN | DEFAULT FALSE | Error flag |
| warning_message | TEXT | | Warning details |
| error_message | TEXT | | Error details |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Shift Types:** `morning`, `afternoon`, `night`

**Calculated Fields:**
- `total_stitches` = (current_running - previous_running) + (rounds_completed × stitches_per_piece)
- `piece_equivalents` = total_stitches / stitches_per_piece

**Business Rules:**
- previous_running auto-populated from last shift for same machine/design
- Negative total_stitches triggers error
- >50 piece_equivalents triggers warning
- Counter > stitches_per_piece without rounds triggers warning

**Indexes:**
- `idx_shift_logs_machine_id` on `machine_id`
- `idx_shift_logs_operator_id` on `operator_id`
- `idx_shift_logs_design_id` on `design_id`
- `idx_shift_logs_shift_date` on `shift_date`
- `idx_shift_logs_machine_date_shift` on `(machine_id, shift_date, shift_type)`

---

## Relationships

### One-to-Many

- **clients** → **lots**: One client can have many lots
- **lots** → **sub_lots**: One lot is split into many sub-lots
- **designs** → **sub_lots**: One design can be used in many sub-lots
- **machines** → **assignments**: One machine can have many assignments (over time)
- **sub_lots** → **assignments**: One sub-lot can have many assignments (split across machines)
- **assignments** → **shift_logs**: One assignment can have many shift logs
- **machines** → **shift_logs**: One machine can have many shift logs
- **operators** → **shift_logs**: One operator can have many shift logs
- **designs** → **shift_logs**: One design can have many shift logs
- **sub_lots** → **sub_lot_state_transitions**: One sub-lot has many state transitions

### Many-to-Many (via junction tables)

- **machines** ↔ **designs** via **machine_design_rotations**: Defines pieces per round for each machine-design combination

---

## Business Rules

### Lot Creation
- Sum of sub-lot piece_count must equal lot total_pieces
- Each sub-lot assigned to one design
- All lots start in 'received' state

### State Transitions
Valid progressions only:
```
received → allocated → in_production → completed → dispatched
```
No backward transitions permitted.

### Assignments
- One active assignment per machine (enforced at application level)
- pieces_completed cannot exceed pieces_issued
- Auto-completes when pieces_completed = pieces_issued

### Shift Logging
- previous_running auto-populated from last shift for same machine/design
- First shift for machine/design has previous_running = 0
- Stitch calculation: `total = current - previous + (rounds × stitches_per_piece)`
- Validation errors for negative totals
- Warnings for excessive output or missing round documentation

### Data Integrity
- Foreign keys with appropriate CASCADE/RESTRICT rules
- Check constraints for positive values
- Unique constraints on identifiers
- Timestamps auto-updated via triggers

---

## Query Patterns

### Common Queries

#### Active Assignments by Machine
```sql
SELECT * FROM assignments 
WHERE machine_id = ? AND status = 'active';
```

#### Previous Running Stitches
```sql
SELECT current_running_stitches 
FROM shift_logs
WHERE machine_id = ? AND design_id = ?
  AND (shift_date < ? OR (shift_date = ? AND shift_type_order < ?))
ORDER BY shift_date DESC, shift_type_order DESC
LIMIT 1;
```

#### Daily Production Report
```sql
SELECT m.identifier, d.identifier, STRING_AGG(o.name), 
       SUM(sl.total_stitches), SUM(sl.piece_equivalents)
FROM shift_logs sl
JOIN machines m ON sl.machine_id = m.id
JOIN designs d ON sl.design_id = d.id
JOIN operators o ON sl.operator_id = o.id
WHERE sl.shift_date = ?
GROUP BY m.id, d.id;
```

#### Operator Salary Report
```sql
SELECT d.identifier, d.rate_per_stitch,
       SUM(sl.total_stitches),
       SUM(sl.total_stitches) * d.rate_per_stitch AS amount
FROM shift_logs sl
JOIN designs d ON sl.design_id = d.id
WHERE sl.operator_id = ? 
  AND sl.shift_date BETWEEN ? AND ?
GROUP BY d.id;
```

---

## Indexes Strategy

### Primary Keys
All tables have auto-incrementing integer primary keys for performance.

### Foreign Keys
Automatically indexed by PostgreSQL.

### Search Fields
- Text fields used in search (name, identifier, phone): B-tree indexes
- Date fields for range queries: B-tree indexes
- State/status enums for filtering: B-tree indexes

### Composite Indexes
- `(machine_id, shift_date, shift_type)` on shift_logs: For previous running lookup
- Unique constraints on business keys (lot_number, sub_lot_number, etc.)

---

## Data Types Rationale

### SERIAL vs BIGSERIAL
- SERIAL (2B max) sufficient for this application scale
- Can migrate to BIGSERIAL if approaching limits

### VARCHAR Lengths
- Identifiers: 100 chars (room for flexible naming)
- Names: 255 chars (standard length)
- Phone: 20 chars (international format)
- State/Status: 50 chars (enum-like)

### DECIMAL for Money
- DECIMAL(10,4) for rate_per_stitch: Precision for micro-payments
- DECIMAL(10,2) for piece_equivalents: Standard precision

### INTEGER for Counts
- Sufficient for stitch counts (2B max)
- Negative values prevented by CHECK constraints

---

## Audit & History

### Updated Timestamps
All core tables have `updated_at` with auto-update trigger.

### State Transitions
`sub_lot_state_transitions` provides complete audit trail with timestamps.

### Immutable Records
Shift logs are append-only; deletion requires explicit action.

---

## Scaling Considerations

### Partitioning (Future)
- shift_logs by date range (monthly/quarterly)
- sub_lot_state_transitions by date

### Archival (Future)
- Move completed lots older than 1 year to archive tables
- Keep shift_logs for current fiscal year + 2 prior years

### Read Replicas
- Reports and dashboard can use read replica
- Shift entry and production use primary

### Materialized Views (Future)
- Daily production summaries
- Monthly salary aggregates
- Machine utilization statistics
