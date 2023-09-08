import React, { useState } from 'react';
import { auth } from '../services/auth';
import { SentenceComponent, Sentence } from './SentenceComponent';

const VocabFormComponent = () => {
    const [topic, settopic] = useState('');
    const [vocabWords, setVocabWords] = useState('');
    const [sentences, setSentences] = useState<Sentence[]>([]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
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
        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '10px' }}>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="topic of Interest" style={{ display: 'block', marginBottom: '10px' }} value={topic} onChange={(e) => settopic(e.target.value)} />
                    <textarea style={{ flex: 1 }} placeholder="Vocabulary Words" value={vocabWords} onChange={(e) => setVocabWords(e.target.value)}></textarea>
                    <button type="submit">Submit</button>
                </form>
                <div>
                    {sentences.map((item, index) => (
                        <SentenceComponent key={index} sentence={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VocabFormComponent;