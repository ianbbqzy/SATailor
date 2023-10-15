import React, { useState, ChangeEvent, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { auth } from '../services/auth';

interface Question {
    id: number;
    prompt: string;
    answer: string;
    feedback?: string;
    tips?: string;
}

const QuestionComponent = ({ question }: { question: Question }) => {
    const [answer, setAnswer] = useState<string>(question.answer);
    const [feedback, setFeedback] = useState<string | undefined>(question.feedback);
    const [isModified, setIsModified] = useState<boolean>(false);
    const [tips, setTips] = useState<string | undefined>(question.tips);
    const [lastFeedback, setLastFeedback] = useState<string | undefined>(question.feedback);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAnswer(event.target.value);
        setIsModified(true);
    };

    const getFeedback = async function* (question: string, answer: string) {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const params = new URLSearchParams({ question, answer });
            
            // const response = await fetch(`http://seerlight-dev4.us-east-2.elasticbeanstalk.com/feedback?${params.toString()}`, {
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

    const handleFeedback = async (question: string, answer: string) => {
        if (isModified) {
            setIsModified(false);
            const feedbackGenerator = getFeedback(question, answer);
            for await (const feedback of feedbackGenerator) {
                setFeedback(feedback);
                setLastFeedback(feedback);
            }
        } else {
            setFeedback(lastFeedback);
        }
    };

    return (
        <Grid item xs={12} key={question.id}>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="h6" gutterBottom>
                            {question.prompt}
                        </Typography>
                        <TextField
                            multiline
                            minRows={4}
                            variant="outlined"
                            fullWidth
                            value={answer}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" color="primary" onClick={() => handleFeedback(question.prompt, answer)} style={{ marginTop: '10px' }}>
                            Get Feedback
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setFeedback(question.tips)} style={{ marginTop: '10px' }}>
                            Show Tips
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography
                            variant="body1"
                            style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
                        >
                            {feedback || ''}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
};

const questions: Question[] = [
    { id: 1, prompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.', answer: '', tips: 'Tip 1' },
    { id: 2, prompt: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?', answer: '', tips: 'Tip 2' },
    // Add more placeholder questions as needed
];

const Feedback = () => {
    const [questions, setQuestions] = useState<{ [key: string]: Question[] }>({});
    const [selectedCollege, setSelectedCollege] = useState<string>('');

    useEffect(() => {
        const fetchEssayPrompts = async () => {
            try {
                const token = await auth.currentUser?.getIdToken(true);
                if (!token) {
                    return;
                }
                const response = await fetch('http://localhost:8080/essay_prompts', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setQuestions(data.content);
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };


        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchEssayPrompts();
            }
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
    
    }, []);

    const handleCollegeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedCollege(event.target.value as string);
    };

    return (
        <Grid container spacing={3}>
            <FormControl variant="outlined" style={{ marginBottom: '20px', marginLeft: '20px', marginTop: '20px', width: '200px' }}>
                <InputLabel id="college-select-label">College</InputLabel>
                <Select
                    labelId="college-select-label"
                    id="college-select"
                    value={selectedCollege}
                    onChange={handleCollegeChange}
                    label="College"
                >
                    {questions && Object.keys(questions).map((college) => (
                        <MenuItem key={college} value={college}>{college}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {questions[selectedCollege]?.map(q => (
                <QuestionComponent question={q} />
            ))}
        </Grid>
    );
};

export default Feedback;

