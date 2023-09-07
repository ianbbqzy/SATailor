import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import the Navbar component
import { UserProvider } from './context/user';

const App = () =>{
    return (
        <UserProvider>
            <Router>
                <Navbar /> {/* Add the Navbar component */}
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
        </UserProvider>
    )
}

export default App;