import React, { useState } from 'react';
import { View, TextInput, Button, Text, CheckBox } from 'react-native';
import { auth } from '../services/auth';

// ... existing code ...

const VocabFormComponent = () => {
    // ... existing code ...

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ marginRight: '10px' }}>
                <TextInput style={{ marginBottom: '10px' }} value={topic} onChangeText={settopic} placeholder="topic of Interest" />
                <TextInput multiline={true} value={vocabWords} onChangeText={setVocabWords} placeholder="Vocabulary Words" />
                <Button title="Submit" onPress={handleSubmit} />
                <View>
                    {sentences.map((item, index) => (
                        <SentenceComponent key={index} sentence={item} />
                    ))}
                </View>
            </View>
        </View>
    );
};

const SentenceComponent = (props: {sentence: Sentence}) => {
    // ... existing code ...

    return (
            <View>
                <Text>{sentence.word}: {sentence.sentence}</Text>
                <CheckBox value={sentence.isSaved} onValueChange={(isChecked) => handleSave(sentence, isChecked)} />
                <Text>Save</Text>
                <CheckBox 
                    value={sentence.isFavorite} 
                    onValueChange={(isChecked) => handleFavorite(sentence, isChecked)} 
                    disabled={!sentence.isSaved}
                />
                <Text>Favorite</Text>                        
            </View>
        )}
;

export default VocabFormComponent;