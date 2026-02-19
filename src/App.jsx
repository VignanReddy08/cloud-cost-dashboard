import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CostExplorer from './pages/CostExplorer';
import Budgets from './pages/Budgets';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="cost-explorer" element={<CostExplorer />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
