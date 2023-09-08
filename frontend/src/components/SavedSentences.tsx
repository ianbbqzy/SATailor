    import React, { useState, useEffect } from 'react';
    import { auth } from '../services/auth';
    import SentenceComponent from './SentenceComponent';

    const SavedSentences = () => {
        const [sentences, setSentences] = useState([]);
        const [filter, setFilter] = useState({ word: '', topic: '', isFavorite: false });
        const [localFilter, setLocalFilter] = useState({ word: '', topic: '', isFavorite: false });

        useEffect(() => {
            fetchSentences();
        }, [filter]);

        const fetchSentences = async () => {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`http://localhost:8080/sentences?word=${filter.word}&topic=${filter.topic}&isFavorite=${filter.isFavorite}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setSentences(data);
        };

        const handleLocalFilter = () => {
            setSentences(sentences.filter(sentence => {
                return (localFilter.word ? sentence.word.includes(localFilter.word) : true) &&
                    (localFilter.topic ? sentence.topic.includes(localFilter.topic) : true) &&
                    (localFilter.isFavorite !== null ? sentence.isFavorite === localFilter.isFavorite : true);
            }));
        };

        return (
            <div>
                <form onSubmit={e => e.preventDefault()}>
                    <input type="text" placeholder="Word" value={filter.word} onChange={e => setFilter({ ...filter, word: e.target.value })} />
                    <input type="text" placeholder="Topic" value={filter.topic} onChange={e => setFilter({ ...filter, topic: e.target.value })} />
                    <input type="checkbox" checked={filter.isFavorite} onChange={e => setFilter({ ...filter, isFavorite: e.target.checked })} /> Favorite
                    <button onClick={fetchSentences}>Filter</button>
                </form>
                <form onSubmit={e => e.preventDefault()}>
                    <input type="text" placeholder="Word" value={localFilter.word} onChange={e => setLocalFilter({ ...localFilter, word: e.target.value })} />
                    <input type="text" placeholder="Topic" value={localFilter.topic} onChange={e => setLocalFilter({ ...localFilter, topic: e.target.value })} />
                    <input type="checkbox" checked={localFilter.isFavorite} onChange={e => setLocalFilter({ ...localFilter, isFavorite: e.target.checked })} /> Favorite
                    <button onClick={handleLocalFilter}>Local Filter</button>
                </form>
                {sentences.map(sentence => <SentenceComponent key={sentence.sentenceId} sentence={sentence} />)}
            </div>
        );
    };

    export default SavedSentences;