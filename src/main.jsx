import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AppProvider } from "./context/AppContext.jsx";
import errorReporter from "./services/errorReporter";

// Initialize error reporter
errorReporter.init();

ReactDOM.createRoot(document.getElementById("root")).render(
    <AppProvider>
        <App />
    </AppProvider>,
);
