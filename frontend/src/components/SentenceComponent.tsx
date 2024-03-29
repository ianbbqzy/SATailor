import React, { useState } from 'react';
import { auth } from '../services/auth';
import { View, Text, Switch, Alert, Platform, StyleSheet } from 'react-native'; // Import necessary components from react-native

interface Sentence {
    userId: string;
    sentenceId: string;
    word: string;
    topic: string;
    sentence: string;
    isFavorite: boolean;
    isSaved: boolean;
}

const SentenceComponent = (props: {sentence: Sentence}) => {
    const [sentence, setSentence] = useState<Sentence>({
        ...props.sentence,
        isSaved: props.sentence.isSaved || false,
        isFavorite: props.sentence.isFavorite || false
    });

    const handleSave = async (sentence: Sentence, isChecked: boolean) => {
        try {
            if (auth.currentUser) {
                if (isChecked) {
                    // Optimistically update the state
                    setSentence(prevSentence => ({...prevSentence, isSaved: true}));

                    const response = await fetch(`${process.env.BACKEND_URL}/sentence`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                        },
                        body: JSON.stringify({
                            userId: auth.currentUser.uid,
                            sentenceId: sentence.sentenceId,
                            word: sentence.word,
                            topic: sentence.topic,
                            sentence: sentence.sentence,
                            isFavorite: false
                        })
                    });
                    if (!response.ok) {
                        // Revert the state if the request fails
                        setSentence(prevSentence => ({...prevSentence, isSaved: false}));
                        throw Error(`HTTP error! status: ${response.status}`);
                    }
                } else {
                    // Optimistically update the state
                    const prevIsFavorite = sentence.isFavorite;
                    setSentence(prevSentence => ({...prevSentence, isSaved: false, isFavorite: false}));

                    // Call delete endpoint
                    const response = await fetch(`${process.env.BACKEND_URL}/sentence/${auth.currentUser.uid}/${sentence.sentenceId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                        }
                    });
                    if (!response.ok) {
                        // Revert the state if the request fails
                        setSentence(prevSentence => ({...prevSentence, isSaved: true, isFavorite: prevIsFavorite}));
                        throw Error(`HTTP error! status: ${response.status}`);
                    }
                }
            }
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const handleFavorite = async (sentence: Sentence, isChecked: boolean) => {
        // Optimistically update the state
        setSentence(prevSentence => ({...prevSentence, isFavorite: isChecked}));

        try {
            if (auth.currentUser) {
                const response = await fetch(`http://localhost:8080/sentence/${auth.currentUser.uid}/${sentence.sentenceId}?isFavorite=${isChecked}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                    }
                });
                if (!response.ok) {
                    // Revert the state if the request fails
                    setSentence(prevSentence => ({...prevSentence, isSaved: true, isFavorite: !isChecked}));
                    throw Error(`HTTP error! status: ${response.status}`);
                }
            }
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.wordContainer}>
                <Text style={styles.word}>{sentence.word}</Text>
                <Text style={styles.topic}>({sentence.topic})</Text>
            </View>
            <View style={styles.switchContainer}>
                <Switch 
                    value={sentence.isSaved} 
                    onValueChange={(isChecked) => handleSave(sentence, isChecked)} 
                />
                <Text>Save</Text>
                <Switch 
                    value={sentence.isFavorite} 
                    onValueChange={(isChecked) => handleFavorite(sentence, isChecked)} 
                    disabled={!sentence.isSaved}
                />
                <Text>Favorite</Text>
            </View>
            <Text style={styles.sentence}>{sentence.sentence}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 10,
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    word: {
        flex: 1,
        flexWrap: 'wrap',
    },
    topic: {
        flex: 1,
        flexWrap: 'wrap',
        fontStyle: 'italic',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    sentence: {
        flex: 1,
        flexWrap: 'wrap',
    },
});

export { SentenceComponent, Sentence };