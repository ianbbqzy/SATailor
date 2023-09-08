    import React, { useState } from 'react';
    import { auth } from '../services/auth';

    interface Sentence {
        userId: string;
        sentenceId: string;
        word: string;
        topic: string;
        sentence: string;
        isFavorite: boolean;
        isSaved: boolean;
    }

    const SentenceComponent = (props: {sentence: Sentence}) => {
        const [sentence, setSentence] = useState<Sentence>({
            ...props.sentence,
            isSaved: props.sentence.isSaved || false,
            isFavorite: props.sentence.isFavorite || false
        });

        const handleSave = async (sentence: Sentence, isChecked: boolean) => {
            try {
                if (auth.currentUser) {
                    if (isChecked) {
                        // Optimistically update the state
                        setSentence(prevSentence => ({...prevSentence, isSaved: true}));

                        const response = await fetch(`http://localhost:8080/sentence`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                            },
                            body: JSON.stringify({
                                userId: auth.currentUser.uid,
                                sentenceId: sentence.sentenceId,
                                word: sentence.word,
                                topic: sentence.topic,
                                sentence: sentence.sentence,
                                isFavorite: false
                            })
                        });
                        if (!response.ok) {
                            // Revert the state if the request fails
                            setSentence(prevSentence => ({...prevSentence, isSaved: false}));
                            throw Error(`HTTP error! status: ${response.status}`);
                        }
                    } else {
                        // Optimistically update the state
                        const prevIsFavorite = sentence.isFavorite;
                        setSentence(prevSentence => ({...prevSentence, isSaved: false, isFavorite: false}));

                        // Call delete endpoint
                        const response = await fetch(`http://localhost:8080/sentence/${auth.currentUser.uid}/${sentence.sentenceId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                            }
                        });
                        if (!response.ok) {
                            // Revert the state if the request fails
                            setSentence(prevSentence => ({...prevSentence, isSaved: true, isFavorite: prevIsFavorite}));
                            throw Error(`HTTP error! status: ${response.status}`);
                        }
                    }
                }
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };

        const handleFavorite = async (sentence: Sentence, isChecked: boolean) => {
            // Optimistically update the state
            setSentence(prevSentence => ({...prevSentence, isFavorite: isChecked}));

            try {
                if (auth.currentUser) {
                    const response = await fetch(`http://localhost:8080/sentence/${auth.currentUser.uid}/${sentence.sentenceId}?isFavorite=${isChecked}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${await auth.currentUser.getIdToken(true)}`
                        }
                    });
                    if (!response.ok) {
                        // Revert the state if the request fails
                        setSentence(prevSentence => ({...prevSentence, isSaved: true, isFavorite: !isChecked}));
                        throw Error(`HTTP error! status: ${response.status}`);
                    }
                }
            } catch (error: any) {
                alert(`An error occurred: ${error.message}`);
            }
        };

        return (
                <div>
                    <p>{sentence.word}: {sentence.sentence}</p>
                    <input type="checkbox" checked={sentence.isSaved} onChange={(e) => handleSave(sentence, e.target.checked)} /> Save
                    <input 
                        type="checkbox" 
                        checked={sentence.isFavorite} 
                        onChange={(e) => handleFavorite(sentence, e.target.checked)} 
                        disabled={!sentence.isSaved}
                    /> Favorite                        
                </div>
            )
    };

    export { SentenceComponent, Sentence };
