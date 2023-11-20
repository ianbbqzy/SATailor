import React, { useContext } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import the Navbar component
import { UserContext, UserProvider } from './context/user';
import SavedSentences from './components/SavedSentences'; // Import the SavedSentences component
import Feedback from './components/Feedback';
import FeedbackPage from "./components/FormattedFeedback";
import Profile from './components/Profile'; // Import the Profile component
import Login from './components/Login';
import Layout from "./components/Layout";

const App = () =>{
    return (
        <UserProvider>
            <Router basename={process.env.PUBLIC_URL}>
                <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<FeedbackPage />} />
                    <Route path="/saved" element={<SavedSentences />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/vocab" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/login" element={<Login />} />
             </Routes>
            </Router>
        </UserProvider>
    )
}

export default App;