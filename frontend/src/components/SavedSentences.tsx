    import React, { useState, useEffect, useContext } from 'react';
    import { auth } from '../services/auth';
    import { SentenceComponent, Sentence } from './SentenceComponent';
    import { UserContext } from '../context/user';

    const SavedSentences = () => {
        const [sentences, setSentences] = useState<Sentence[]>([]);
        const [originalSentences, setOriginalSentences] = useState<Sentence[]>([]);
        const [filter, setFilter] = useState({ word: '', topic: '', isFavorite: false });
        const [localFilter, setLocalFilter] = useState({ word: '', topic: '', isFavorite: false });

        const user = useContext(UserContext); // Get the current user from the context

        useEffect(() => {
            if (user) { // Check if the user is signed in
                fetchSentences();
            }
        }, [user]); // Add user as a dependency

        useEffect(() => {
                handleLocalFilter();
        }, [localFilter]); // Add user as a dependency


        const fetchSentences = async () => {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`http://localhost:8080/sentences?word=${filter.word}&topic=${filter.topic}&isFavorite=${filter.isFavorite}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            // Set isSaved to true for all sentences
            const updatedSentences = data.content.map((sentence: Sentence) => ({ ...sentence, isSaved: true }));
            
            setSentences(updatedSentences);
            setOriginalSentences(updatedSentences);
        };

        const handleLocalFilter = () => {
            setSentences(originalSentences.filter(sentence => {
                return (localFilter.word ? sentence.word.includes(localFilter.word) : true) &&
                    (localFilter.topic ? sentence.topic.includes(localFilter.topic) : true) &&
                    (localFilter.isFavorite === null || localFilter.isFavorite === false ?  true : sentence.isFavorite === localFilter.isFavorite);
            }));
        };

        return (
            <div>
                <form onSubmit={e => {e.preventDefault(); fetchSentences();}}>
                    <input type="text" placeholder="Word" value={filter.word} onChange={e => setFilter({ ...filter, word: e.target.value })} />
                    <input type="text" placeholder="Topic" value={filter.topic} onChange={e => setFilter({ ...filter, topic: e.target.value })} />
                    <input type="checkbox" checked={filter.isFavorite} onChange={e => setFilter({ ...filter, isFavorite: e.target.checked })} /> Favorite
                    <button type="submit">Search</button>
                </form>
                <span>Filter</span>
                <form onSubmit={e => e.preventDefault()}>
                    <input type="text" placeholder="Word" value={localFilter.word} onChange={e => setLocalFilter({ ...localFilter, word: e.target.value })} />
                    <input type="text" placeholder="Topic" value={localFilter.topic} onChange={e => setLocalFilter({ ...localFilter, topic: e.target.value })} />
                    <input type="checkbox" checked={localFilter.isFavorite} onChange={e => setLocalFilter({ ...localFilter, isFavorite: e.target.checked })} /> Favorite
                </form>
                {sentences.map((item, index) => (
                        <SentenceComponent key={index} sentence={item} />
                    ))}
            </div>
        );
    };

    export default SavedSentences;