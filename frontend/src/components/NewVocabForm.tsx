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
            setResponseText(JSON.stringify(data.content));
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '10px' }}>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Subject of Interest" style={{ display: 'block', marginBottom: '10px' }} value={subject} onChange={(e) => setSubject(e.target.value)} />
                    <textarea style={{ flex: 1 }} placeholder="Vocabulary Words" value={vocabWords} onChange={(e) => setVocabWords(e.target.value)}></textarea>
                    <button type="submit">Submit</button>
                </form>
                <div>
                    {responseText.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewVocabFormComponent;