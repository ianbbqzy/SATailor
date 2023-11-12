import React, { useState, useEffect, useContext, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import { UserContext } from '../context/user';
import { auth } from '../services/auth';
import QuestionComponent from './QuestionComponent';
import Tiptap from './Tiptap';
import FormattedFeedback from './FormattedFeedback';
// ... rest of the code ...

const FeedbackPage = () => {
    // ... rest of the code ...
    const { isAnswerModified } = useContext(UserContext);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const intendedAction = useRef(null);

    const handleCollegeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        if (isAnswerModified.current) {
            intendedAction.current = () => setSelectedCollege(event.target.value as string);
            setShowUnsavedChangesDialog(true);
        } else {
            setSelectedCollege(event.target.value as string);
        }
    };

    const handleSaveChanges = () => {
        // Assuming handleSave is a function that saves the current content
        handleSave();
        setShowUnsavedChangesDialog(false);
        if (intendedAction.current) {
            intendedAction.current();
            intendedAction.current = null;
        }
    };

    const handleDiscardChanges = () => {
        // Assuming there's a way to discard changes
        discardChanges();
        setShowUnsavedChangesDialog(false);
        if (intendedAction.current) {
            intendedAction.current();
            intendedAction.current = null;
        }
    };

    const handleCancel = () => {
        setShowUnsavedChangesDialog(false);
    };

    useEffect(() => {
        const beforeUnloadHandler = (event) => {
            if (!isAnswerModified.current) return;
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, []);

    // ... rest of the code ...

    return (
        <div>
            {/* ... rest of the code ... */}
            <Dialog
                open={showUnsavedChangesDialog}
                onClose={handleCancel}
                disableBackdropClick
                disableEscapeKeyDown
            >
                <DialogTitle>{"Unsaved Changes"}</DialogTitle>
                <DialogContent>
                    {"You have unsaved changes. What would you like to do?"}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveChanges} color="primary">
                        Save Changes
                    </Button>
                    <Button onClick={handleDiscardChanges} color="primary">
                        Discard Changes
                    </Button>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ... rest of the code ... */}
        </div>
    );
};

export default FeedbackPage;