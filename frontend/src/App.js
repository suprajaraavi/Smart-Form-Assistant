import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import FormAssistant from "./components/FormAssistant";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FormAssistant backendUrl={BACKEND_URL} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;