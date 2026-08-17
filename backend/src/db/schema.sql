-- Production Tracking System Database Schema

-- Clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Designs
CREATE TABLE IF NOT EXISTS designs (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(100) UNIQUE NOT NULL,
    stitches_per_piece INTEGER NOT NULL CHECK (stitches_per_piece > 0),
    rate_per_stitch DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_designs_identifier ON designs(identifier);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_machines_identifier ON machines(identifier);

-- Machine Design Rotations (pieces per round per design)
CREATE TABLE IF NOT EXISTS machine_design_rotations (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    pieces_per_round INTEGER NOT NULL CHECK (pieces_per_round > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(machine_id, design_id)
);

-- Operators
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operators_name ON operators(name);

-- Lots
CREATE TABLE IF NOT EXISTS lots (
    id SERIAL PRIMARY KEY,
    lot_number VARCHAR(100) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    total_pieces INTEGER NOT NULL CHECK (total_pieces > 0),
    received_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lots_lot_number ON lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_lots_client_id ON lots(client_id);

-- Sub-lots
CREATE TABLE IF NOT EXISTS sub_lots (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    sub_lot_number VARCHAR(100) UNIQUE NOT NULL,
    design_id INTEGER NOT NULL REFERENCES designs(id),
    piece_count INTEGER NOT NULL CHECK (piece_count > 0),
    state VARCHAR(50) NOT NULL DEFAULT 'received' CHECK (state IN ('received', 'allocated', 'in_production', 'completed', 'dispatched')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sub_lots_lot_id ON sub_lots(lot_id);
CREATE INDEX IF NOT EXISTS idx_sub_lots_state ON sub_lots(state);
CREATE INDEX IF NOT EXISTS idx_sub_lots_design_id ON sub_lots(design_id);

-- State Transition Log for audit trail
CREATE TABLE IF NOT EXISTS sub_lot_state_transitions (
    id SERIAL PRIMARY KEY,
    sub_lot_id INTEGER NOT NULL REFERENCES sub_lots(id) ON DELETE CASCADE,
    from_state VARCHAR(50),
    to_state VARCHAR(50) NOT NULL,
    transitioned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments (Machine + Sub-lot allocation)
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    sub_lot_id INTEGER NOT NULL REFERENCES sub_lots(id),
    pieces_issued INTEGER NOT NULL CHECK (pieces_issued > 0),
    pieces_completed INTEGER DEFAULT 0 CHECK (pieces_completed >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assignments_machine_id ON assignments(machine_id);
CREATE INDEX IF NOT EXISTS idx_assignments_sub_lot_id ON assignments(sub_lot_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- Shift Logs (Core complexity - tracks production output)
CREATE TABLE IF NOT EXISTS shift_logs (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    design_id INTEGER NOT NULL REFERENCES designs(id),
    assignment_id INTEGER REFERENCES assignments(id),
    shift_date DATE NOT NULL,
    shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'night')),
    previous_running_stitches INTEGER NOT NULL DEFAULT 0 CHECK (previous_running_stitches >= 0),
    current_running_stitches INTEGER NOT NULL CHECK (current_running_stitches >= 0),
    rounds_completed INTEGER NOT NULL DEFAULT 0 CHECK (rounds_completed >= 0),
    total_stitches INTEGER NOT NULL,
    piece_equivalents DECIMAL(10, 2),
    has_warning BOOLEAN DEFAULT FALSE,
    has_error BOOLEAN DEFAULT FALSE,
    warning_message TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shift_logs_machine_id ON shift_logs(machine_id);
CREATE INDEX IF NOT EXISTS idx_shift_logs_operator_id ON shift_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_shift_logs_design_id ON shift_logs(design_id);
CREATE INDEX IF NOT EXISTS idx_shift_logs_shift_date ON shift_logs(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_logs_machine_date_shift ON shift_logs(machine_id, shift_date, shift_type);

-- Trigger to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON lots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_lots_updated_at BEFORE UPDATE ON sub_lots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_logs_updated_at BEFORE UPDATE ON shift_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
