import React, { useState, ChangeEvent } from 'react';
import { Button, TextField, Grid, Paper, Typography } from '@material-ui/core';
import { auth } from '../services/auth';

interface Question {
    id: number;
    question: string;
    answer: string;
    feedback?: string;
}

const Feedback = () => {
    const [questions, setQuestions] = useState<Question[]>([
        { id: 1, question: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.', answer: '' },
        { id: 2, question: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?', answer: '' },
        // Add more placeholder questions as needed
    ]);

    const handleInputChange = (id: number, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newQuestions = [...questions];
        const index = newQuestions.findIndex(q => q.id === id);
        newQuestions[index].answer = event.target.value;
        setQuestions(newQuestions);
    };

    const getFeedback = async function* (question: string, answer: string) {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const params = new URLSearchParams({ question, answer });
            const response = await fetch(`http://localhost:8080/feedback?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
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
                chunks += new TextDecoder("utf-8").decode(value)

                yield chunks;
            }
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const handleFeedback = async (id: number, question: string, answer: string) => {
        const feedbackGenerator = getFeedback(question, answer);
        for await (const feedback of feedbackGenerator) {
            const newQuestions = [...questions];
            const index = newQuestions.findIndex(q => q.id === id);
            newQuestions[index].feedback = feedback;
            console.log(feedback)
            setQuestions(newQuestions);
        }
    };

    return (
        <Grid container spacing={3}>
            {questions.map(q => (
                <Grid item xs={12} key={q.id}>
                    <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                    {q.question}
                                </Typography>
                                <TextField
                                    multiline
                                    minRows={4}
                                    variant="outlined"
                                    fullWidth
                                    value={q.answer}
                                    onChange={event => handleInputChange(q.id, event)}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" color="primary" onClick={() => handleFeedback(q.id, q.question, q.answer)} style={{ marginTop: '10px' }}>
                                    Get Feedback
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography
                                    variant="body1"
                                    style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
                                >
                                    {q.feedback || ''}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default Feedback;
