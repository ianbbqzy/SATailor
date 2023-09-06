import React, { useState } from 'react';
import { auth } from '../services/auth';

const NewVocabFormComponent = () => {
    const [subject, setSubject] = useState('');
    const [vocabWords, setVocabWords] = useState('');
    const [sentences, setSentences] = useState([]);

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
            setSentences(data.content);
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const handleSave = async (sentence: string, isChecked: boolean) => {
        if (auth.currentUser) {
            if (isChecked) {
                await fetch(`http://localhost:8080/sentence`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                    },
                    body: JSON.stringify({
                        userId: auth.currentUser.uid,
                        word: subject,
                        sentence: sentence,
                        isFavorite: false
                    })
                });
            } else {
                // Call delete endpoint
            }
        }
    };

    const handleFavorite = async (sentenceId: string, isChecked: boolean) => {
        if (auth.currentUser) {
            await fetch(`http://localhost:8080/sentence/${sentenceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                },
                body: JSON.stringify({
                    isFavorite: isChecked
                })
            });
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
                    {sentences.map((item, index) => (
                        <div key={index}>
                            <p>{item.word}: {item.sentence}</p>
                            <input type="checkbox" onChange={(e) => handleSave(item.sentence, e.target.checked)} /> Save
                            <input type="checkbox" onChange={(e) => handleFavorite(item.sentenceId, e.target.checked)} disabled={!item.isSaved} /> Favorite
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewVocabFormComponent;