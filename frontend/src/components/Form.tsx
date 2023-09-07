import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FormComponent = () => {
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [responseText, setResponseText] = useState('Word Mneumonic Device 1: ROYGBIV\nWord Mneumonic Device 2: RGBYIV\n\nSentence Mneumonic Device 1: \"Raging Oranges Yield Great Balls In Victory\"\nSentence Mneumonic Device 2: \"Running Over Yellow Grass, Boys In Green Bring Indigo Victory\"');

    const [textArea, setTextArea] = useState('');
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/generate_streaming?topic=${input2}&text=${textArea}`);
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
                    <input type="text" placeholder="Input 1" style={{ display: 'block', marginBottom: '10px' }} value={input1} onChange={(e) => setInput1(e.target.value)} />
                    <input type="text" placeholder="Input 2" style={{ display: 'block', marginBottom: '10px' }} value={input2} onChange={(e) => setInput2(e.target.value)} />
                    <textarea style={{ flex: 1 }} placeholder="Large Text Area" value={textArea} onChange={(e) => setTextArea(e.target.value)}></textarea>
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

export default FormComponent;

// const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     try {
//         const response = await axios.get(`http://localhost:8080/generate?topic=${input2}&text=${textArea}`);
//         setResponseText(response.data.content);
//     } catch (error: any) {
//         alert(`An error occurred: ${error.message}`);
//     }
// };
