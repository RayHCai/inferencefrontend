import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BACKEND_URL, COLORS } from '../../settings';

import { Loading } from '../../components/loading';

import './forumDetails.css';

export function ForumDetails() {
    const [searchParams, _] = useSearchParams();

    const [loading, updateLoadingState] = useState(false);

    const [posts, updatePosts] = useState([]);
    const [forumName, updateForumName] = useState('');
    const [inferences, updateInferences] = useState(null as any);

    const [questionFilter, updateFilter] = useState(-1);
    const [postFilter, updateFilteredPosts] = useState([] as any);

    useEffect(() => {
        updateLoadingState(true);

        (async function() {
            try {
                let postRes = await fetch(`${BACKEND_URL}/forums/?forum_id=${searchParams.get('forumId')}`);

                if(!postRes.ok) throw new Error('Error occurred while fetching posts');

                let postJson = await postRes.json();

                let inferenceRes = await fetch(`${BACKEND_URL}/foruminference/?forum_id=${searchParams.get('forumId')}`);

                if(!inferenceRes.ok) throw new Error('Error occurred while fetching inferences for post');

                let inferencesJson = await inferenceRes.json();

                updateForumName(postJson.data.name);
                updatePosts(postJson.data.posts);
                updateInferences(inferencesJson.data);
            }
            catch(error) {
                alert((error as Error).message);
            }
            finally {
                updateLoadingState(false);
            }
        })();
    }, []);

    if(loading) return <Loading />;

    function filterQ(qIndex: number) {
        if(qIndex == -1) return;
        
        updateFilter(qIndex);
    }
    
    function filterSimilarity(postInd: number, qIndex: number) {
        updateLoadingState(true);

        (async function() {
            try {
                let relationRes = await fetch(`${BACKEND_URL}/postrelations/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify({
                        question: inferences.questions[qIndex],
                        forum_id: searchParams.get('forumId'),
                        post_id: postInd
                    })
                });

                let relationJson = await relationRes.json();
                
                let filteredPostIds = [];

                for(let [k, _] of Object.entries(relationJson.data)) {
                    filteredPostIds.push(k);
                }

                updateFilteredPosts([...filteredPostIds]);
                updateFilter(qIndex);
            }
            catch(error) {
                alert((error as Error).message);
            }
            finally {
                updateLoadingState(false);
            }
        })();
    }

    function masterFilter(postId: number, qIndex: number) {
        if(window.confirm('Filter by similarity?')) filterSimilarity(postId, qIndex);
        else filterQ(qIndex);
    }

    return (
        <div className="forum-details-container">
            <h1>{ forumName }</h1>

            <button 
                onClick={
                    () => {
                        updateFilter(-1);
                        updateFilteredPosts([]);
                    } 
                } 
                className="styled-button-dark"
            >
                Reset filters
            </button>
            
            {
                inferences ? (
                    inferences.questions.map(
                        (q: string, index: number) => (
                            <h4
                                style={ {color: COLORS[index] }} 
                                key={ index }
                                onClick={ () => filterQ(index) }
                            >
                                { q }
                            </h4>
                        )    
                    )
                ) : null
            }

            {
                posts.map(
                    (post: any) => {
                        if(postFilter.length !== 0 && !postFilter.includes((post.id).toString())) return;

                        let postSpans = [];

                        let postInferences = inferences.inferences[post.id];

                        let colors = (new Array<string>(post.message.length)).fill('white');
                        
                        for(let i = 0; i < postInferences.length; i++) {
                            let ans = postInferences[i];
                            let startInd = ans.start_ind;
                            let endInd = ans.end_ind;

                            for(let j = startInd; j <= endInd; j++) {
                                colors[j] = COLORS[i];
                            }
                        }

                        for(let i = 0; i < post.message.length; i++) {
                            let c = post.message[i];

                            let qInd = -1;

                            if(colors[i] !== 'white') qInd = COLORS.indexOf(colors[i]);

                            postSpans.push(
                                <span 
                                    onClick={ 
                                        () => masterFilter(post.id, qInd) 
                                    } 
                                    className={ 
                                        `${colors[i] !== 'white' ? 'answer' : ''} 
                                        ${qInd !== questionFilter && questionFilter !== -1 ? 'hidden' : ''}` 
                                    } 
                                    style={ {color: colors[i] } }
                                >
                                    { c }
                                </span>
                            );
                        }

                        return (
                            <div className="post-container">
                                <h2>{ post.user_full_name }</h2>
                                
                                {
                                    postSpans.map(
                                        (sp) => sp
                                    )
                                }
                            </div>
                        );
                    }
                )
            }
        </div>
    );
}
