import React, { useState } from 'react';
import { auth } from '../services/auth';
import { SentenceComponent, Sentence } from './SentenceComponent';
import { View, TextInput, Button, Alert, ScrollView } from 'react-native'; // Import necessary components from react-native

const VocabFormComponent = () => {
    const [topic, settopic] = useState('');
    const [vocabWords, setVocabWords] = useState('');
    const [sentences, setSentences] = useState<Sentence[]>([]);

    const handleSubmit = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`http://localhost:8080/prompt_vocab?topic=${topic}&text=${vocabWords}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSentences(data.content);
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ marginRight: 10 }}>
                <TextInput style={{ marginBottom: 10 }} placeholder="topic of Interest" value={topic} onChangeText={(text) => settopic(text)} />
                <TextInput multiline style={{ flex: 1 }} placeholder="Vocabulary Words" value={vocabWords} onChangeText={(text) => setVocabWords(text)} />
                <Button title="Submit" onPress={() => handleSubmit()} />                <ScrollView>
                    {sentences.map((item, index) => (
                        <SentenceComponent key={index} sentence={item} />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default VocabFormComponent;