import React, { useState, useEffect, useContext } from 'react';
import { auth } from '../services/auth';
import { SentenceComponent, Sentence } from './SentenceComponent';
import { UserContext } from '../context/user';
import { View, TextInput, Switch, Button, ScrollView, Text } from 'react-native'; // Import necessary components from react-native

const SavedSentences = () => {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [originalSentences, setOriginalSentences] = useState<Sentence[]>([]);
    const [filter, setFilter] = useState({ word: '', topic: '', isFavorite: false });
    const [localFilter, setLocalFilter] = useState({ word: '', topic: '', isFavorite: false });

    const user = useContext(UserContext); // Get the current user from the context

    useEffect(() => {
        if (user) { // Check if the user is signed in
            fetchSentences();
        }
    }, [user]); // Add user as a dependency

    useEffect(() => {
            handleLocalFilter();
    }, [localFilter]); // Add user as a dependency


    const fetchSentences = async () => {
        const token = await auth.currentUser?.getIdToken(true);
        const response = await fetch(`http://localhost:8080/sentences?word=${filter.word}&topic=${filter.topic}&isFavorite=${filter.isFavorite}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        // Set isSaved to true for all sentences
        const updatedSentences = data.content.map((sentence: Sentence) => ({ ...sentence, isSaved: true }));
        
        setSentences(updatedSentences);
        setOriginalSentences(updatedSentences);
    };

    const handleLocalFilter = () => {
        const newSentences = originalSentences.filter(sentence => {
            return (localFilter.word ? sentence.word.includes(localFilter.word) : true) &&
                (localFilter.topic ? sentence.topic.includes(localFilter.topic) : true) &&
                (localFilter.isFavorite === null || localFilter.isFavorite === false ?  true : sentence.isFavorite === localFilter.isFavorite);
        })
        setSentences(newSentences);
    };

    return (
        <View>
            <Text>Search</Text>
            <TextInput 
                style={{ borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 5 }} 
                placeholder="Word" 
                placeholderTextColor="gray"
                value={filter.word} 
                onChangeText={text => setFilter({ ...filter, word: text })} 
            />
            <TextInput 
                style={{ borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 5 }} 
                placeholder="Topic" 
                placeholderTextColor="gray"
                value={filter.topic} 
                onChangeText={text => setFilter({ ...filter, topic: text })} 
            />
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={filter.isFavorite ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={isChecked => setFilter({ ...filter, isFavorite: isChecked })}
                value={filter.isFavorite}
            />
            <Button title="Search" onPress={fetchSentences} />
            <Text>Local Filter</Text>
            <TextInput 
                style={{ borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 5 }} 
                placeholder="Word" 
                placeholderTextColor="gray"
                value={localFilter.word} 
                onChangeText={text => setLocalFilter({ ...localFilter, word: text })} 
            />
            <TextInput 
                style={{ borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 5 }} 
                placeholder="Topic" 
                placeholderTextColor="gray"
                value={localFilter.topic} 
                onChangeText={text => setLocalFilter({ ...localFilter, topic: text })} 
            />
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={localFilter.isFavorite ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={isChecked => setLocalFilter({ ...localFilter, isFavorite: isChecked })}
                value={localFilter.isFavorite}
                />
            <ScrollView>
                {sentences.map((item) => (
                    <SentenceComponent key={item.sentenceId} sentence={item} />
                ))}
            </ScrollView>
        </View>
    );
};

export default SavedSentences;