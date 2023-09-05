import React, { useState } from 'react';
import { auth } from '../services/auth';

const NewVocabFormComponent = () => {
    const [subject, setSubject] = useState('');
    const [vocabWords, setVocabWords] = useState('');
    const [responseText, setResponseText] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`http://localhost:8080/prompt_vocab?subject=${subject}&text=${vocabWords}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResponseText(data.content);
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    // ... existing code ...
};

export default NewVocabFormComponent;