import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recorder from "./components/recorder";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recorder />} />
        {}
        <Route path="/analyze" element={<div>Analysis Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;
