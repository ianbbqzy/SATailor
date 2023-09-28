import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavigationContainer } from '@react-navigation/native';
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import the Navbar component
import { UserProvider } from './context/user';
import SavedSentences from './components/SavedSentences'; // Import the SavedSentences component
import { Platform } from 'react-native';

const App = () =>{
    return (
        <UserProvider>
            {Platform.OS === 'web' ? (
                <Router>
                    <Navbar /> {/* Add the Navbar component */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/saved" element={<SavedSentences />} /> {/* Add a new route for the SavedSentences component */}
                    </Routes>
                </Router>
            ) : (
                <NavigationContainer>
                    <Navbar /> {/* Add the Navbar component */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/saved" element={<SavedSentences />} /> {/* Add a new route for the SavedSentences component */}
                    </Routes>
                </NavigationContainer>
            )}
        </UserProvider>
    )
}

export default App;