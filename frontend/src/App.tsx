import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recorder from "./components/recorder";
import Analyze from "./components/analyze";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recorder />} />

        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </Router>
  );
}

export default App;
