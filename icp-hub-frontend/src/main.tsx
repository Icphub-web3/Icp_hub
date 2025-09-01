import React from "react";
import ReactDOM from "react-dom/client";

const App = () => <h1>ICP Hub Frontend is running!</h1>;

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
