import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreatorHub from './pages/CreatorHub';
import Subscription from './pages/Subscription';
import Registration from './pages/Registration';

// IMPORTANT: Ensure this matches your latest deployment!
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const ABI = [
  "function userRoles(address) public view returns (uint8)",
  "function isSubscribed(address) public view returns (bool)"
];

function App() {
  const [account, setAccount] = useState("");
  const [userRole, setUserRole] = useState(0); // 0 = None, 1 = Listener, 2 = Artist
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Trigger contract check whenever the connected wallet changes
  useEffect(() => {
    if (account) {
      checkUserStatus(account);
    } else {
      setUserRole(0);
      setIsSubscribed(false);
    }
  }, [account]);

  const checkUserStatus = async (userAddress) => {
    setIsChecking(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const role = await contract.userRoles(userAddress);
      const subscribed = await contract.isSubscribed(userAddress);

      setUserRole(Number(role));
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
    setIsChecking(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        {/* Pass userRole to Navbar so it knows which links to show */}
        <Navbar onAccountChange={setAccount} userRole={userRole} />

        {/* The Gatekeeper Logic */}
        {account && userRole === 0 && !isChecking ? (
          <Registration
            account={account}
            onComplete={(newRole) => setUserRole(newRole)}
          />
        ) : (
          <Routes>
            <Route path="/" element={<Home isSubscribed={isSubscribed} />} />
            <Route path="/subscription" element={<Subscription />} />

            {/* Protected Artist Routes - Redirect to Home if not an Artist */}
            <Route path="/creator" element={userRole === 2 ? <CreatorHub /> : <Navigate to="/" />} />
            <Route path="/dashboard" element={userRole === 2 ? <Dashboard /> : <Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;