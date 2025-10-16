import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import Inbox from "./pages/Inbox";
import Compose from "./pages/Compose";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/compose" element={<Compose />} />
      </Routes>
    </Router>
  );
}

export default App;