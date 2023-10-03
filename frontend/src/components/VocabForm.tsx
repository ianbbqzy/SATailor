import React, { useState } from 'react';
import { auth } from '../services/auth';
import { SentenceComponent, Sentence } from './SentenceComponent';
import { View, TextInput, Button, Text, ScrollView } from 'react-native'; // Import necessary components from react-native

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
                <Text style={{ marginBottom: 10 }}>Topic of Interest:</Text>
                <TextInput 
                    style={{ borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 5 }} 
                    value={topic} 
                    onChangeText={(text) => settopic(text)} 
                />
                <Text style={{ marginBottom: 10 }}>Vocabulary Words: (Separate words with commas)</Text>
                <TextInput 
                    multiline 
                    style={{ flex: 1, borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 5 }} 
                    value={vocabWords} 
                    onChangeText={(text) => setVocabWords(text)} 
                />
                <Button title="Submit" onPress={() => handleSubmit()} />
                <ScrollView>
                    {sentences.map((item) => (
                        <SentenceComponent key={item.sentenceId} sentence={item} />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default VocabFormComponent;