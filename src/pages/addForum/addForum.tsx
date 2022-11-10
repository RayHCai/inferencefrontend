import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BACKEND_URL } from '../../settings';

import { Loading } from '../../components/loading';

import './addForum.css';

export function AddForum() {
    const navigate = useNavigate();

    const [forumCSV, updateForumCSV] = useState([]);
    const [questions, updateQuestions] = useState([] as any[]);
    
    const [isLoading, updateLoadingState] = useState(false);

    function addQuestion() {
        updateQuestions([...questions, 
            {
                question: ''
            }
        ]);
    }

    function updateQuestion(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        let updatedQuestions = questions;

        (updatedQuestions as any)[index].question = e.target.value;
        
        updateQuestions(updatedQuestions);
    }

    function createNewForum() {
        updateLoadingState(true);

        try {
            if(forumCSV.length === 0) throw new Error('Need to upload a CSV file');
            else if(forumCSV.length > 1) throw new Error('Can only upload one file at a time');
            
            let forumFile: Blob = forumCSV[0];
    
            if(forumFile.type.indexOf('csv') === -1) throw new Error('Type of file must be a CSV');
            
            (async function() {
                let forumRequestData = new FormData();
                forumRequestData.append('file', forumFile);

                let forumRes = await fetch(`${BACKEND_URL}/forums/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: forumRequestData
                });
                
                if(!forumRes.ok) throw new Error('An error while creating forum. Please try again later.');
                
                let forumResponseJson = await forumRes.json();

                let cleanedQuestions = questions.map(q => (q as any).question);

                let inferencesRes = await fetch(`${BACKEND_URL}/foruminference/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify({
                        forum_id: forumResponseJson.data,
                        questions: cleanedQuestions
                    })
                });

                if(!inferencesRes.ok) throw new Error('Error occurred while fetching post');
                else navigate('/');
            })();
        }
        catch(error) {
            alert((error as Error).message);
        }
        finally {
            updateLoadingState(false);
            updateQuestions([]);
        }
    }
    
    if(isLoading) return <Loading />;
    
    return (
        <div className="forum-create-container">
            <label className="custom-forum-file-upload">
                <input 
                    className="forum-file-upload" 
                    type="file" 
                    name="forum-csv" 
                    onChange={ 
                        e => updateForumCSV(e.target.files as any) 
                    } 
                />
                
                Upload CSV
            </label>
            
            
            <button className="styled-button-dark" onClick={ addQuestion }>
                Add question
            </button>
            
            <div>
                {
                    questions.map(
                        (_, index) => (
                            <input 
                                className="inference-question-input"
                                key={ index }
                                onChange={ 
                                    (e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(e, index) 
                                } 
                            />
                        )
                    )                
                }
            </div>
            
            <button className="styled-button-colored" onClick={ createNewForum }>
                Create forum and inferences
            </button>
        </div>
    );        
}
