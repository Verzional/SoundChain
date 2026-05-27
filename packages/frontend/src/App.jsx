import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Upload from "./pages/Upload"
import Dashboard from "./pages/Dashboard"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}