import React, { useState, ChangeEvent, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box } from '@material-ui/core';
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
    const [lastFeedback, setLastFeedback] = useState<string | undefined>(question.feedback);
    const [tab, setTab] = useState<string>('tips');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAnswer(event.target.value);
        setIsModified(true);
    };

    const getFeedback = async function* (question: string, answer: string) {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const params = new URLSearchParams({ question, answer });
            
            // const response = await fetch(`http://seerlight-dev4.us-east-2.elasticbeanstalk.com/feedback?${params.toString()}`, {
            const response = await fetch(`${process.env.BACKEND_URL}/feedback?${params.toString()}`, {
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
            setFeedback('getting feedback...');
            const feedbackGenerator = getFeedback(question, answer);
            for await (const feedback of feedbackGenerator) {
                setFeedback(feedback);
                setLastFeedback(feedback);
            }
        } else {
            setFeedback(lastFeedback);
        }
    };

    const handleTabChange = (event?: React.ChangeEvent<{}>, newValue?: string) => {
        setTab(newValue || 'tips');
        if (newValue === 'tips') {
            setFeedback(question.tips);
        } else {
            handleFeedback(question.prompt, answer);
        }
    };

    return (
        <Grid item xs={12} key={question.id}>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="body1" gutterBottom>
                            {question.prompt}
                        </Typography>
                        <TextField
                            multiline
                            minRows={10}
                            variant="outlined"
                            fullWidth
                            value={answer}
                            onChange={handleInputChange}
                        />
                        <Button variant="contained" color="primary" onClick={() => handleTabChange(undefined, 'feedback')} style={{ marginTop: '10px' }}>
                            Get Feedback
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Tabs value={tab} onChange={handleTabChange} aria-label="feedback and tips tabs" style={{ marginTop: '10px' }}>
                            <Tab label="Tips" value="tips" />
                            <Tab label="Feedback" value="feedback" />
                        </Tabs>
                        <TabPanel value={tab} index="feedback">
                            <Typography
                                variant="body1"
                                style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
                            >
                                {feedback || ''}
                            </Typography>
                        </TabPanel>
                        <TabPanel value={tab} index="tips">
                            <Typography
                                variant="body1"
                                style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
                            >
                                {question.tips || ''}
                            </Typography>
                        </TabPanel>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
  }
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

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
                const response = await fetch(`${process.env.BACKEND_URL}/essay_prompts`, {
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

