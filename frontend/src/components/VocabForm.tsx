import React, { useState } from 'react';

const VocabFormComponent = () => {
    const [subject, setSubject] = useState('');
    const [vocabWords, setVocabWords] = useState('');
    const [responseText, setResponseText] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/generate_streaming_vocab?subject=${subject}&text=${vocabWords}`);
            if (!response.body) {
                throw Error("ReadableStream not yet supported in this browser.");
            }
            const reader = response.body.getReader();
            let chunks = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                chunks += new TextDecoder("utf-8").decode(value);
                setResponseText(chunks);
            }
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

export default VocabFormComponent;