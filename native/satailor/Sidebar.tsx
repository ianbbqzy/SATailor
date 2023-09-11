import React from 'react';
import { View, Text, Animated } from 'react-native';
import UserAuthWidget from './UserAuthWidget';

export default function Sidebar({ visible }) {
    const slideAnim = React.useRef(new Animated.Value(-500)).current;

    React.useEffect(() => {

    Animated.timing(slideAnim, {
        toValue: visible ? 0 : -500,
        duration: 500,
        useNativeDriver: true,
    }).start();

    }, [visible]);

    return (
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            <Text>SATailor</Text>
            <UserAuthWidget />
        </Animated.View>
    );

}