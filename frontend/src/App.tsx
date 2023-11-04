import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import the Navbar component
import { UserProvider } from './context/user';
import SavedSentences from './components/SavedSentences'; // Import the SavedSentences component
import Feedback from './components/Feedback';
import FeedbackPage from "./components/FormattedFeedback";
import Profile from './components/Profile'; // Import the Profile component

const App = () =>{
    return (
        <UserProvider>
            <Router basename={process.env.PUBLIC_URL}>
                <Navbar /> {/* Add the Navbar component */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/saved" element={<SavedSentences />} /> {/* Add a new route for the SavedSentences component */}
                    <Route path="/feedback" element={<Feedback />} /> {/* Add a new route for the Feedback component */}
                    <Route path="/feedback_page" element={<FeedbackPage />} /> {/* Add a new route for the FeedbackPage component */}
                    <Route path="/profile" element={<Profile />} /> {/* Add a new route for the Profile component */}
                </Routes>
            </Router>
        </UserProvider>
    )
}

export default App;