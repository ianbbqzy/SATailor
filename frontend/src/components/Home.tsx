import React, { useContext } from 'react';
import { View } from 'react-native';
import { auth, googleProvider } from '../services/auth';
import { UserContext } from '../context/user';
import VocabFormComponent from './VocabForm';

const Home = () => {
    // ... existing code ...

    return (
        <View>
            <VocabFormComponent/>
        </View>
    )
}

export default Home;