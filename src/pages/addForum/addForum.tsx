import { useState } from 'react';

import { Loading } from '../../components/loading';
import { BACKEND_URL } from '../../settings';

import './addForum.css';

export function AddForum() {
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
        if(forumCSV.length === 0) {
            alert('Need to upload a CSV file');

            return;
        }
        else if(forumCSV.length > 1) {
            alert('Can only upload one forum at a time');

            return;
        }
        
        let forumFile: Blob = forumCSV[0];

        if(forumFile.type.indexOf('csv') === -1) {
            alert('Type of file must be a CSV');

            return;
        }

        updateLoadingState(true);
        
        (async function() {
            try {
                let requestData = new FormData();
                requestData.append('file', forumFile);

                let forumRes = await fetch(`${BACKEND_URL}/forums/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: requestData
                });
                
                if(!forumRes.ok) throw new Error('Error while fetching');
                
                let forumResponseJson = await forumRes.json();

                let cleanedQuestions: string[] = [];

                for(let q of questions) {
                    cleanedQuestions.push((q as any).question);
                }

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
                else {
                    alert('Successfully added Forum and made inferences');
                }
            }
            catch(error) {
                alert((error as Error).message);
            }
            finally {
                updateLoadingState(false);
            }
        })();
    }
    
    if(isLoading) return <Loading />;
    
    return (
        <div className="forum-create-container">
            <input 
                className="forum-file-upload" 
                type="file" name="forum-csv" 
                onChange={ 
                    (e) => updateForumCSV(e.target.files as any) 
                } 
            />
            
            <button className="styled-button-dark" onClick={ addQuestion }>Add question</button>
            
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
            
            <button className="styled-button-colored" onClick={ createNewForum }>Create forum and inferences</button>
        </div>
    );        
}
