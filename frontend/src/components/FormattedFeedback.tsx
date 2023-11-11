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
            <Tiptap highlight={highlight} onChange={handleAnswerChange} onContentChange={() => { isAnswerModified.current = true; }} onSave={() => { isAnswerModified.current = false; }} content={selectedVersion ? selectedVersion.response : ''}/>
            {/* ... rest of the code ... */}
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