import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateBatch from "./pages/CreateBatch";
import BatchDetails from "./pages/BatchDetails";
import ConsumerView from "./pages/ConsumerView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-batch" element={<CreateBatch />} />

        {/* Changed :id to :batchId */}
        <Route path="/batch/:batchId" element={<BatchDetails />} />

        <Route path="/consumer/:id" element={<ConsumerView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;