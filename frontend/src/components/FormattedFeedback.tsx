import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Button, TextField, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box } from '@material-ui/core';
import { auth } from '../services/auth';
import { Marker } from "react-mark.js";
import { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Tiptap from './Tiptap';

interface Question {
    id: number;
    prompt: string;
    answer: string;
    feedback?: string;
    tips?: string;
}

interface Feedback {
    excerpt_feedbacks: {excerpt: string, feedback: string}[];
    general_overview: string;
    conclusion: string;
}

const QuestionComponent = ({ question }: { question: Question }) => {
    // const [answer, setAnswer] = useState<string>(question.answer);
    const [notes, setNotes] = useState<string>("");
    const [feedback, setFeedback] = useState<Feedback>({
        excerpt_feedbacks: [],
        general_overview: "No response submitted yet.",
        conclusion: ""
    });
    const [suggestion, setSuggestion] = useState<string | undefined>("No notes submitted yet.");
    const isAnswerModified = useRef<boolean>(false);
    const answer = useRef<string>('');
    const [isNotesModified, setIsNotesModified] = useState<boolean>(false);
    const [guideTab, setGuideTab] = useState<string>('tips');
    const [promptTab, setPromptTab] = useState<string>('notes');
    const [highlight, setHighlight] = useState<string>('');

    const handleAnswerChange = (modifiedAnswer: string) => {
        answer.current = modifiedAnswer;
        // setIsAnswerModified(true);
        isAnswerModified.current = true;
    };

    const handleNotesChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNotes(event.target.value);
        setIsNotesModified(true);
    };

    const getFeedback = async function (question: string, answer: string) {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const params = new URLSearchParams({ question, answer });
            
            // const response = await fetch(`http://seerlight-dev4.us-east-2.elasticbeanstalk.com/feedback?${params.toString()}`, {
            const response = await fetch(`${process.env.BACKEND_URL}/formatted_feedback?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setFeedback(data.content);
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const getSuggestion = async function* (question: string, notes: string) {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const params = new URLSearchParams({ question, notes });
            
            // const response = await fetch(`http://seerlight-dev4.us-east-2.elasticbeanstalk.com/feedback?${params.toString()}`, {
            const response = await fetch(`${process.env.BACKEND_URL}/suggestion?${params.toString()}`, {
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

    const handleFeedback = async () => {
        setGuideTab('feedback');
        if (isAnswerModified.current) {
            isAnswerModified.current = false;
            setFeedback({
                ...feedback,
                "general_overview": "getting feedback..."
            })
            getFeedback(question.prompt, answer.current)
        }
    };

    const handleBrainstorm = async () => {
        setGuideTab('suggestion');
        if (isNotesModified) {
            setIsNotesModified(false);
            setSuggestion('getting brainstorm notes...');
            const suggestionGenerator = getSuggestion(question.prompt, notes);
            for await (const suggestion of suggestionGenerator) {
                setSuggestion(suggestion);
            }
        }
    };

    const handleGuideTabChange = (event?: React.ChangeEvent<{}>, newValue?: string) => {
        setGuideTab(newValue || 'tips');
    };

    const handlePromptTabChange = (event?: React.ChangeEvent<{}>, newValue?: string) => {
        setPromptTab(newValue || 'response');
    };

    const highlightExcerpt = (excerpt: string) => {
        // const highlightedAnswer = answer.replace(excerpt, `<mark>${excerpt}</mark>`);
        setHighlight(excerpt);
    };

    const handleSave = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`${process.env.BACKEND_URL}/essay_responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    college: selectedCollege,
                    promptId: question.id,
                    response: answer.current
                })
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
            alert('Essay saved successfully!');
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
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
                        <Tabs value={promptTab} onChange={handlePromptTabChange} aria-label="response and brainstorm tabs" style={{ marginTop: '10px' }}>
                            <Tab label="Notes" value="notes" />
                            <Tab label="Response" value="response" />
                        </Tabs>
                        <TabPanel value={promptTab} index="response">
                            <Tiptap highlight={highlight} onChange={handleAnswerChange}/>
                            <Button variant="contained" color="primary" onClick={() => handleFeedback()} style={{ marginTop: '10px' }}>
                                Get Feedback
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '10px' }}>
                                Save
                            </Button>
                        </TabPanel>
                        <TabPanel value={promptTab} index="notes">
                            <TextField
                                multiline
                                minRows={10}
                                variant="outlined"
                                fullWidth
                                value={notes}
                                onChange={handleNotesChange}
                            />
                            <Button variant="contained" color="primary" onClick={() => handleBrainstorm()} style={{ marginTop: '10px' }}>
                                Help Me Brainstorm
                            </Button>
                        </TabPanel>
                    </Grid>
                    <Grid item xs={6}>
                        <Tabs value={guideTab} onChange={handleGuideTabChange} aria-label="feedback and tips tabs" style={{ marginTop: '10px' }}>
                            <Tab label="Tips" value="tips" />
                            <Tab label="Suggestion" value="suggestion" />
                            <Tab label="Feedback" value="feedback" />
                        </Tabs>
                        <TabPanel value={guideTab} index="feedback">
                            <DetailedFeedback feedback={feedback} highlightExcerpt={highlightExcerpt} />
                        </TabPanel>
                        <TabPanel value={guideTab} index="suggestion">
                            <Typography
                                variant="body1"
                                style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
                            >
                                {suggestion || ''}
                            </Typography>
                        </TabPanel>
                        <TabPanel value={guideTab} index="tips">
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

const DetailedFeedback = ({ feedback, highlightExcerpt }: { feedback: Feedback, highlightExcerpt: (excerpt: string) => void }) => {
    return <>
            <Typography
                variant="body1"
                style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
            >
                {feedback.general_overview || ''}
            </Typography>
            {/* List the excerpt feedback below. */}
            {feedback.excerpt_feedbacks.map((excerpt_feedback, index) => (
                <div key={index} 
                     style={{border: '1px solid #ccc', borderRadius: '5px', padding: '10px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)', transition: 'box-shadow 0.3s ease'}}
                     onMouseEnter={(e) => { 
                         e.currentTarget.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.3)';
                         highlightExcerpt(excerpt_feedback.excerpt);
                     }}
                     onMouseLeave={(e) => {
                         e.currentTarget.style.boxShadow = '0px 0px 5px rgba(0,0,0,0.1)';
                         highlightExcerpt("");
                     }}
                >
                    <Typography variant="body1" style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                        {`Excerpt: ${excerpt_feedback.excerpt}`}
                    </Typography>
                    <Typography variant="body1" style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                        {`Feedback: ${excerpt_feedback.feedback}`}
                    </Typography>
                </div>
            ))}
            <Typography
                variant="body1"
                style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}
            >
                {feedback.conclusion || ''}
            </Typography>
        </>
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: string;
    value: string;
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

const FeedbackPage = () => {
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

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchEssayPrompts();
            }        
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
    
    }, []);

    useEffect(() => {
        const fetchEssayResponses = async () => {
            try {
                const token = await auth.currentUser?.getIdToken(true);
                if (!token) {
                    return;
                }
                const response = await fetch(`${process.env.BACKEND_URL}/essay_responses/${selectedCollege}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // TODO: Use the fetched responses to populate the corresponding text fields in the user interface.
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };
        if (selectedCollege) {
            fetchEssayResponses();
        }
    }, [selectedCollege]);

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

export default FeedbackPage;