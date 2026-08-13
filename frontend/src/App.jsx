import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InboundUI from './pages/InboundUI';
import ProductionUI from './pages/ProductionUI';
import ShiftEntry from './pages/ShiftEntry';
import MasterData from './pages/MasterData';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inbound" element={<InboundUI />} />
        <Route path="production" element={<ProductionUI />} />
        <Route path="master-data" element={<MasterData />} />
      </Route>
      <Route path="/shift/:machineId" element={<ShiftEntry />} />
    </Routes>
  );
}

export default App;
