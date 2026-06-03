import { Navigate, Route, Routes } from "react-router-dom";
import PracticePage from "./pages/PracticePage";
import DayPage from "./pages/DayPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/practice" replace />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/practice/day/:id" element={<DayPage />} />
      <Route path="*" element={<Navigate to="/practice" replace />} />
    </Routes>
  );
}
