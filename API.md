# API Documentation

Base URL: `http://localhost:3000/api` (development) or `https://yourdomain.com/api` (production)

All requests and responses use JSON format.

## Table of Contents
1. [Master Data](#master-data)
2. [Lot Management](#lot-management)
3. [Production](#production)
4. [Shift Logging](#shift-logging)

---

## Master Data

### Clients

#### List Clients
```
GET /api/clients
```

Query Parameters:
- `search` (optional): Search term for name or phone

Response:
```json
[
  {
    "id": 1,
    "name": "ABC Textiles",
    "phone": "+91 98765 43210",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Client
```
GET /api/clients/:id
```

#### Create Client
```
POST /api/clients
```

Request Body:
```json
{
  "name": "ABC Textiles",
  "phone": "+91 98765 43210"
}
```

#### Update Client
```
PUT /api/clients/:id
```

Request Body: Same as Create

#### Delete Client
```
DELETE /api/clients/:id
```

---

### Designs

#### List Designs
```
GET /api/designs
```

Query Parameters:
- `search` (optional): Search term for identifier

Response:
```json
[
  {
    "id": 1,
    "identifier": "ROSE-001",
    "stitches_per_piece": 578293,
    "rate_per_stitch": "0.0015",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Design
```
GET /api/designs/:id
```

#### Create Design
```
POST /api/designs
```

Request Body:
```json
{
  "identifier": "ROSE-001",
  "stitchesPerPiece": 578293,
  "ratePerStitch": 0.0015
}
```

Notes:
- `stitchesPerPiece` must be positive
- `ratePerStitch` is optional and mutable

#### Update Design
```
PUT /api/designs/:id
```

Request Body: Same as Create

#### Delete Design
```
DELETE /api/designs/:id
```

---

### Machines

#### List Machines
```
GET /api/machines
```

Query Parameters:
- `search` (optional): Search term for identifier or name

Response:
```json
[
  {
    "id": 1,
    "identifier": "M-001",
    "name": "Tajima TMEX-C1501",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Machine (with Rotations)
```
GET /api/machines/:id
```

Response includes rotation data:
```json
{
  "id": 1,
  "identifier": "M-001",
  "name": "Tajima TMEX-C1501",
  "rotations": [
    {
      "id": 1,
      "machine_id": 1,
      "design_id": 1,
      "design_identifier": "ROSE-001",
      "pieces_per_round": 6,
      "stitches_per_piece": 578293
    }
  ]
}
```

#### Create Machine
```
POST /api/machines
```

Request Body:
```json
{
  "identifier": "M-001",
  "name": "Tajima TMEX-C1501",
  "rotations": [
    {
      "designId": 1,
      "piecesPerRound": 6
    }
  ]
}
```

#### Update Machine
```
PUT /api/machines/:id
```

Request Body (basic info only):
```json
{
  "identifier": "M-001",
  "name": "Tajima TMEX-C1501"
}
```

#### Update Machine Rotations
```
PUT /api/machines/:id/rotations
```

Request Body:
```json
{
  "rotations": [
    {
      "designId": 1,
      "piecesPerRound": 6
    },
    {
      "designId": 2,
      "piecesPerRound": 8
    }
  ]
}
```

#### Delete Machine
```
DELETE /api/machines/:id
```

---

### Operators

#### List Operators
```
GET /api/operators
```

Query Parameters:
- `search` (optional): Search term for name or phone

Response:
```json
[
  {
    "id": 1,
    "name": "Rajesh Kumar",
    "phone": "+91 98765 00001",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Operator
```
GET /api/operators/:id
```

#### Create Operator
```
POST /api/operators
```

Request Body:
```json
{
  "name": "Rajesh Kumar",
  "phone": "+91 98765 00001"
}
```

#### Update Operator
```
PUT /api/operators/:id
```

Request Body: Same as Create

#### Delete Operator
```
DELETE /api/operators/:id
```

---

## Lot Management

### Lots

#### List Lots
```
GET /api/lots
```

Query Parameters:
- `clientId` (optional): Filter by client
- `fromDate` (optional): Filter by received date (YYYY-MM-DD)
- `toDate` (optional): Filter by received date (YYYY-MM-DD)

Response:
```json
[
  {
    "id": 1,
    "lot_number": "LOT-2024-001",
    "client_id": 1,
    "client_name": "ABC Textiles",
    "total_pieces": 1000,
    "received_date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Lot (with Sub-Lots)
```
GET /api/lots/:id
```

Response includes sub-lots:
```json
{
  "id": 1,
  "lot_number": "LOT-2024-001",
  "client_id": 1,
  "client_name": "ABC Textiles",
  "total_pieces": 1000,
  "received_date": "2024-01-15",
  "subLots": [
    {
      "id": 1,
      "lot_id": 1,
      "sub_lot_number": "LOT-2024-001-A",
      "design_id": 1,
      "design_identifier": "ROSE-001",
      "piece_count": 600,
      "state": "received",
      "stitches_per_piece": 578293
    }
  ]
}
```

#### Create Lot (with Sub-Lots)
```
POST /api/lots
```

Request Body:
```json
{
  "lotNumber": "LOT-2024-001",
  "clientId": 1,
  "totalPieces": 1000,
  "receivedDate": "2024-01-15",
  "subLots": [
    {
      "subLotNumber": "LOT-2024-001-A",
      "designId": 1,
      "pieceCount": 600
    },
    {
      "subLotNumber": "LOT-2024-001-B",
      "designId": 2,
      "pieceCount": 400
    }
  ]
}
```

Validation:
- Sum of sub-lot pieces must equal lot total pieces
- All piece counts must be positive

#### Update Lot
```
PUT /api/lots/:id
```

Request Body (basic info only, sub-lots cannot be modified after creation):
```json
{
  "lotNumber": "LOT-2024-001",
  "clientId": 1,
  "totalPieces": 1000,
  "receivedDate": "2024-01-15"
}
```

#### Delete Lot
```
DELETE /api/lots/:id
```

Note: Cascades to delete all sub-lots

---

### Sub-Lots

#### List Sub-Lots
```
GET /api/sublots
```

Query Parameters:
- `state` (optional): Filter by state (received, allocated, in_production, completed, dispatched)
- `designId` (optional): Filter by design

Response:
```json
[
  {
    "id": 1,
    "lot_id": 1,
    "sub_lot_number": "LOT-2024-001-A",
    "design_id": 1,
    "design_identifier": "ROSE-001",
    "piece_count": 600,
    "state": "allocated",
    "stitches_per_piece": 578293,
    "lot_number": "LOT-2024-001",
    "client_name": "ABC Textiles"
  }
]
```

#### Get Sub-Lot
```
GET /api/sublots/:id
```

#### Update Sub-Lot State
```
PUT /api/sublots/:id/state
```

Request Body:
```json
{
  "state": "allocated"
}
```

Valid State Transitions:
- `received` → `allocated`
- `allocated` → `in_production`
- `in_production` → `completed`
- `completed` → `dispatched`

Error Response (invalid transition):
```json
{
  "error": "Invalid state transition from in_production to received"
}
```

#### Get State History
```
GET /api/sublots/:id/history
```

Response:
```json
[
  {
    "id": 1,
    "sub_lot_id": 1,
    "from_state": null,
    "to_state": "received",
    "transitioned_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "sub_lot_id": 1,
    "from_state": "received",
    "to_state": "allocated",
    "transitioned_at": "2024-01-15T11:00:00.000Z"
  }
]
```

---

## Production

### Assignments

#### List Assignments
```
GET /api/assignments
```

Query Parameters:
- `machineId` (optional): Filter by machine
- `status` (optional): Filter by status (active, completed)

Response:
```json
[
  {
    "id": 1,
    "machine_id": 1,
    "machine_identifier": "M-001",
    "machine_name": "Tajima TMEX-C1501",
    "sub_lot_id": 1,
    "sub_lot_number": "LOT-2024-001-A",
    "sub_lot_total_pieces": 600,
    "design_identifier": "ROSE-001",
    "stitches_per_piece": 578293,
    "pieces_issued": 300,
    "pieces_completed": 150,
    "status": "active",
    "assigned_at": "2024-01-15T08:00:00.000Z",
    "completed_at": null
  }
]
```

#### Get Assignment
```
GET /api/assignments/:id
```

#### Get Active Assignment for Machine
```
GET /api/assignments/machine/:machineId/active
```

Response:
- 200 with assignment data if active assignment exists
- 404 if no active assignment

#### Create Assignment
```
POST /api/assignments
```

Request Body:
```json
{
  "machineId": 1,
  "subLotId": 1,
  "piecesIssued": 300
}
```

Validation:
- Only one active assignment per machine allowed
- Pieces issued must be positive

Error Response (machine busy):
```json
{
  "error": "Machine already has an active assignment (Assignment ID: 5)"
}
```

#### Update Assignment Progress
```
PUT /api/assignments/:id/progress
```

Request Body:
```json
{
  "piecesCompleted": 150
}
```

Notes:
- Automatically sets status to 'completed' when piecesCompleted >= piecesIssued
- Sets completed_at timestamp

#### Complete Assignment
```
PUT /api/assignments/:id/complete
```

No request body required. Sets:
- status = 'completed'
- pieces_completed = pieces_issued
- completed_at = current timestamp

---

## Shift Logging

### Shift Logs

#### List Shift Logs
```
GET /api/shiftlogs
```

Query Parameters:
- `machineId` (optional): Filter by machine
- `operatorId` (optional): Filter by operator
- `designId` (optional): Filter by design
- `fromDate` (optional): Filter by date (YYYY-MM-DD)
- `toDate` (optional): Filter by date (YYYY-MM-DD)

Response:
```json
[
  {
    "id": 1,
    "machine_id": 1,
    "machine_identifier": "M-001",
    "machine_name": "Tajima TMEX-C1501",
    "operator_id": 1,
    "operator_name": "Rajesh Kumar",
    "design_id": 1,
    "design_identifier": "ROSE-001",
    "stitches_per_piece": 578293,
    "assignment_id": 1,
    "shift_date": "2024-01-15",
    "shift_type": "morning",
    "previous_running_stitches": 0,
    "current_running_stitches": 348963,
    "rounds_completed": 1,
    "total_stitches": 363139,
    "piece_equivalents": "0.63",
    "has_warning": false,
    "has_error": false,
    "warning_message": null,
    "error_message": null
  }
]
```

#### Get Shift Log
```
GET /api/shiftlogs/:id
```

#### Create Shift Log
```
POST /api/shiftlogs
```

Request Body:
```json
{
  "machineId": 1,
  "operatorId": 1,
  "designId": 1,
  "assignmentId": 1,
  "shiftDate": "2024-01-15",
  "shiftType": "morning",
  "currentRunningStitches": 348963,
  "roundsCompleted": 1
}
```

Notes:
- `previousRunningStitches` is auto-populated from last shift
- Stitch calculation performed automatically
- Warnings/errors set based on validation

Shift Types:
- `morning`
- `afternoon`
- `night`

Response includes calculated fields:
```json
{
  "id": 1,
  "previous_running_stitches": 0,
  "total_stitches": 363139,
  "piece_equivalents": "0.63",
  "has_warning": false,
  "has_error": false,
  ...
}
```

#### Get Previous Running Stitches
```
GET /api/shiftlogs/previous-running
```

Query Parameters (all required):
- `machineId`: Machine ID
- `designId`: Design ID
- `beforeDate` (optional): Date to search before (YYYY-MM-DD)
- `beforeShiftType` (optional): Shift type to search before (morning/afternoon/night)

Response:
```json
{
  "previousRunningStitches": 564117
}
```

Returns 0 if no previous shift found.

#### Get Daily Production Report
```
GET /api/shiftlogs/daily-production
```

Query Parameters:
- `date` (required): Date (YYYY-MM-DD)

Response:
```json
[
  {
    "machine_identifier": "M-001",
    "machine_name": "Tajima TMEX-C1501",
    "design_identifier": "ROSE-001",
    "operators": "Rajesh Kumar, Priya Sharma",
    "total_stitches": "1547823",
    "total_piece_equivalents": "2.68"
  }
]
```

#### Get Salary Report
```
GET /api/shiftlogs/salary-report/:operatorId
```

Query Parameters:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)

Response:
```json
{
  "designs": [
    {
      "design_identifier": "ROSE-001",
      "rate_per_stitch": "0.0015",
      "total_stitches": "1547823",
      "amount": "2321.73"
    },
    {
      "design_identifier": "LOTUS-002",
      "rate_per_stitch": null,
      "total_stitches": "894561",
      "amount": null
    }
  ],
  "totalStitches": 2442384,
  "grandTotal": 2321.73,
  "hasAllRates": false
}
```

Notes:
- `grandTotal` is `null` if any design is missing rate
- `hasAllRates` indicates if all designs have rates set

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate, business rule violation)
- `500` - Internal Server Error

### Common Errors

#### Validation Error
```json
{
  "error": "Name is required"
}
```

#### Not Found
```json
{
  "error": "Client not found"
}
```

#### Duplicate
```json
{
  "error": "Design identifier already exists"
}
```

#### Business Rule Violation
```json
{
  "error": "Sub-lot pieces (1200) must equal lot total pieces (1000)"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing in production:
- Per-IP rate limiting
- Per-endpoint throttling
- Burst allowance for legitimate traffic

## Authentication

**Current Status**: No authentication implemented.

For production, implement:
- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for programmatic access

## Versioning

API is currently unversioned. Future versions will use URL-based versioning:
- `/api/v1/clients`
- `/api/v2/clients`

## CORS

CORS is configured via environment variable:
```
CORS_ORIGIN=https://yourdomain.com
```

For development, set to:
```
CORS_ORIGIN=http://localhost:5173
```

## Pagination

Currently not implemented. All list endpoints return complete result sets.

For large datasets, implement:
- Limit/offset pagination
- Cursor-based pagination for real-time data
