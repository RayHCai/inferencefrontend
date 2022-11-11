import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BACKEND_URL } from '../../settings';
import { createInferences } from '../../utils';

import { Loading } from '../../components/loading';

import './addForum.css';

export function AddForum() {
    const navigate = useNavigate();

    const questions = useRef([] as any[]);
    const [numQuestions, updateNumQuestions] = useState(0);

    const [forumCSV, updateForumCSV] = useState([]);
    const [isLoading, updateLoadingState] = useState(false);

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

                let cleanedQuestions = questions.current.map(q => (q as any).value);

                let inferencesRes = await createInferences(forumResponseJson.data as string, cleanedQuestions);

                if(!inferencesRes.ok) throw new Error('Error occurred while fetching post');
                else navigate('/');
            })();
        }
        catch(error) {
            alert((error as Error).message);
        }
        finally {
            updateLoadingState(false);
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
            
            <button className="styled-button-dark" onClick={ () => updateNumQuestions(numQuestions + 1) }>
                Add question
            </button>
            
            <div>

                {
                    (new Array(numQuestions)).fill((<input />)).map(
                        (_, index) => (
                            <input 
                                className="inference-question-input"
                                key={ index }
                                ref={ el => questions.current[index] = el }
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
