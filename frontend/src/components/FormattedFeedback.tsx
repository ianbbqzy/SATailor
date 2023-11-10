import React, { useState, ChangeEvent, useEffect, useRef, useContext, useMemo } from 'react';
import { Button, TextField, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box } from '@material-ui/core';
import { auth } from '../services/auth';
import Tiptap from './Tiptap';
import { UserContext } from '../context/user';

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

const QuestionComponent = ({ selectedCollege, question }: { selectedCollege: string, question: Question }) => {
    const [notes, setNotes] = useState<string>("");
    const [feedback, setFeedback] = useState<Feedback>({
        excerpt_feedbacks: [],
        general_overview: "No response submitted yet.",
        conclusion: ""
    });
    const [suggestion, setSuggestion] = useState<string | undefined>("No notes submitted yet.");
    const isAnswerModified = useRef<boolean>(false);
    const [isNotesModified, setIsNotesModified] = useState<boolean>(false);
    const [guideTab, setGuideTab] = useState<string>('tips');
    const [promptTab, setPromptTab] = useState<string>('notes');
    const [highlight, setHighlight] = useState<string>('');
    const answer = useRef<string>(question.answer);
    const [versions, setVersions] = useState<{timestamp: string, response: string}[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<{timestamp: string, response: string} | null>(null);
    const [selectedTimestamp, setSelectedTimestamp] = useState<string>('');

    const handleAnswerChange = (modifiedAnswer: string) => {
        answer.current = modifiedAnswer;
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
        setHighlight(excerpt);
    };

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const token = await auth.currentUser?.getIdToken(true);
                const response = await fetch(`${process.env.BACKEND_URL}/essay_response_versions/${selectedCollege}/${question.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const fetchedVersions = data.content as {timestamp: string, response: string}[]
                setVersions(fetchedVersions);
                if (fetchedVersions.length > 0) {
                    setSelectedVersion(fetchedVersions[0])
                    setSelectedTimestamp(fetchedVersions[0].timestamp)
                }            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };
        fetchVersions();
    }, [question]);

    const handleSave = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`${process.env.BACKEND_URL}/essay_responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
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
            const fetchVersions = async () => {
                try {
                    const token = await auth.currentUser?.getIdToken(true);
                    const response = await fetch(`${process.env.BACKEND_URL}/essay_response_versions/${selectedCollege}/${question.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    const fetchedVersions = data.content as {timestamp: string, response: string}[]
                    setVersions(fetchedVersions);
                    if (fetchedVersions.length > 0) {
                        setSelectedVersion(fetchedVersions[0])
                        setSelectedTimestamp(fetchedVersions[0].timestamp)
                    }
                } catch (error: any) {
                    alert(`An error occurred: ${error.message}`);
                }
            };
            fetchVersions();
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
                            <Tiptap highlight={highlight} onChange={handleAnswerChange} content={selectedVersion ? selectedVersion.response : ''}/>
                            <Button variant="contained" color="primary" onClick={() => handleFeedback()} style={{ marginTop: '10px' }}>
                                Get Feedback
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '10px' }}>
                                Save
                            </Button>
                            <FormControl variant="outlined" style={{ marginTop: '10px' }}>
                                <InputLabel id="version-select-label">Version</InputLabel>
                                <Select
                                    labelId="version-select-label"
                                    id="version-select"
                                    // Can directly use selectedVersion.timestamp. it wouldn't update for some reasons
                                    value={selectedTimestamp}
                                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                        const selectedTimestamp = event.target.value as string;
                                        const selectedVersion = versions.find(version => version.timestamp === selectedTimestamp);
                                        setSelectedVersion(selectedVersion || null);
                                        isAnswerModified.current = true;
                                    }}
                                    label="Version"
                                    style={{ minWidth: 275 }}
                                >
                                    {versions.map((version, index) => (
                                        <MenuItem key={version.timestamp} value={version.timestamp}>{version.timestamp}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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

interface UserResponse {
    userId: string,
    college: string,
    promptId: number,
    response: string,
    timestamp: string
}

const FeedbackPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedCollege, setSelectedCollege] = useState<string>('');
    const [colleges, setColleges] = useState<string[]>([]);

    const user = useContext(UserContext);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const token = await user?.getIdToken(true);
                if (!token) {
                    return
                }
                const response = await fetch(`${process.env.BACKEND_URL}/colleges`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setColleges(data.content);
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };

        fetchColleges();
    }, [user])

    useEffect(() => {
        const fetchPrompts = async () => {
            let prompts: { [key: number]: Question } = {};
            try {
                const token = await user?.getIdToken(true);
                if (!token || !selectedCollege) {
                    return
                }
                const response = await fetch(`${process.env.BACKEND_URL}/essay_prompts/${selectedCollege}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                data.content.forEach((question: Question) => {
                    prompts[question.id] = question;
                });
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }

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
                data.content.forEach((response: UserResponse) => {
                    prompts[response.promptId].answer = response.response
                });
                console.log(prompts)
                setQuestions(Object.values(prompts));
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };

        fetchPrompts();
    
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
                    {colleges && colleges.map((college) => (
                        <MenuItem key={college} value={college}>{college}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {questions?.map(q => (
                <QuestionComponent selectedCollege={selectedCollege} question={q} />
            ))}
        </Grid>
    );
};

export default FeedbackPage;