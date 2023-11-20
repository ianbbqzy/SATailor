import React, { useState, ChangeEvent, useEffect, useRef, useContext, useMemo } from 'react';
import { Button, TextField, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
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
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState<boolean>(false);

    const handleAnswerChange = (modifiedAnswer: string) => {
        answer.current = modifiedAnswer;
        isAnswerModified.current = true;
    };

    const handleNotesChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNotes(event.target.value);
        setIsNotesModified(true);
    };

    // ... rest of the code ...

    useEffect(() => {
        window.addEventListener('beforeunload', (e) => {
            if (isAnswerModified.current) {
                e.preventDefault();
                setShowUnsavedChangesDialog(true);
            }
        });
        return () => {
            window.removeEventListener('beforeunload', (e) => {});
        };
    }, []);

    // ... rest of the code ...

    return (
        <Grid item xs={12} key={question.id}>
            {/* ... rest of the code ... */}
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
                                    value={selectedTimestamp}
                                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                        const selectedTimestamp = event.target.value as string;
                                        const selectedVersion = versions.find(version => version.timestamp === selectedTimestamp);
                                        setSelectedVersion(selectedVersion || null);
                                        setSelectedTimestamp(selectedTimestamp);
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
            <Dialog
                open={showUnsavedChangesDialog}
                onClose={() => setShowUnsavedChangesDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Unsaved Changes"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have unsaved changes. Do you want to save them before leaving?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSave} color="primary">
                        Save Changes
                    </Button>
                    <Button onClick={() => { isAnswerModified.current = false; setShowUnsavedChangesDialog(false); }} color="primary" autoFocus>
                        Discard Changes
                    </Button>
                    <Button onClick={() => setShowUnsavedChangesDialog(false)} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

// ... rest of the code ...

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