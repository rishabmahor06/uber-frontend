import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { UserDataProvider } from "./context/UserContext.jsx";
import CaptainContext from "./context/CaptainContext.jsx";
import SocketProvider from "./context/SocketContext.jsx";

// Create container for app
const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(container);

// Render app with providers
root.render(
  <StrictMode>
    <Router>
      <div className="app-wrapper">
        <CaptainContext>
          <UserDataProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </UserDataProvider>
        </CaptainContext>
      </div>
    </Router>
  </StrictMode>
);
