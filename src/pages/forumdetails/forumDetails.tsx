import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BACKEND_URL, COLORS } from '../../settings';
import { createInferences } from '../../utils';

import { Loading } from '../../components/loading';
import { ForumDetailsModal } from '../../components/forumDetailsModal';

import './forumDetails.css';

export function ForumDetails() {
    const [searchParams, _] = useSearchParams();

    const grades = useRef({} as any);
    const selected = useRef({} as any);

    const [loading, updateLoadingState] = useState(false);

    const [posts, updatePosts] = useState([]);
    const [forumName, updateForumName] = useState('');
    const [inferences, updateInferences] = useState(null as any);

    const [questionFilter, updateFilter] = useState(-1);
    const [postFilter, updateFilteredPosts] = useState([] as any);
    const [isFiltering, updateFilterStatus] = useState(false);
    const [filterObj, updateFilterObj] = useState({} as any);

    const [updateQuestion, updateQuestionState] = useState(false);

    const newQuestion = useRef(null as any);

    const [newInferences, updateInference] = useState({} as any);

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

    function filterQ(qIndex: number) {
        if(qIndex === -1) return;

        updateFilter(qIndex);
    }
    
    function filterBySimilarity(postInd: number, qIndex: number, similarity: number) {
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
                        post_id: postInd,
                        similarity: similarity
                    })
                });
                
                let relationJson = await relationRes.json();
                
                let filteredPostIds = Object.keys(relationJson.data);

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

    function masterFilter(filterSimilarity: boolean, similarity: number=0) {
        updateFilterStatus(false);

        if(filterSimilarity) filterBySimilarity(filterObj.postId, filterObj.qIndex, similarity);
        else filterQ(filterObj.qIndex);
    }

    function updateQuestionsMaster(index: number) {
        let selectedPosts = Object.keys(selected.current).filter(
            postId => selected.current[postId].checked
        )

        if(selectedPosts.length === 0) return alert('No posts to check against. Please select at least one post.');

        updateQuestionState(true);
        updateFilter(index);
        updateFilteredPosts(selectedPosts);
    }

    function testNewQuestion() {
        updateLoadingState(true);
        
        try {
            (async function() {
                let updateQuestionPosts = Object.keys(selected.current).filter(
                    k => selected.current[k]
                );
                
                let newRes = await fetch(`${BACKEND_URL}/questioninference/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify({
                        question: newQuestion.current.value,
                        forum_id: searchParams.get('forumId'),
                        post_ids: JSON.stringify(updateQuestionPosts)
                    })
                });
                
                let newJson = await newRes.json();
                
                console.log(newJson.data.inferences, JSON.stringify(updateQuestionPosts));

                updateInference(newJson.data.inferences);
            })();
        }
        catch(error) {
            alert((error as Error).message);
        }
        finally {
            updateLoadingState(false);
        }
    }

    function finalizeGrades() {
        let jsonGrades = JSON.stringify(posts.map((e: any) => {
            return {[e.id]:grades.current[e.id].map((v: any) => Number(v.value))}
        }));

        let a = window.document.createElement('a');

        a.href = window.URL.createObjectURL(new Blob([jsonGrades], {type: 'application/json'}));
        a.download = `${forumName}-grades.json`;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    }

    function saveNewQuestions() {
        updateLoadingState(true);
        
        try {
            (async function() {
                let res = await fetch(`${BACKEND_URL}/deleteinferences/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify({
                        forum_id: searchParams.get('forumId')
                    })
                });
                
                if(!res.ok) throw new Error('An error occurred while deleting inferences');
                
                let cleanedQuestions = [...inferences.questions];

                cleanedQuestions[questionFilter] = newQuestion;

                let inferencesRes = await createInferences(searchParams.get('forumId') as string, cleanedQuestions);

                if(!inferencesRes.ok) throw new Error('Error occurred while creating inferences');
                else window.location.reload();
            })();
        }
        catch(error) {
            alert((error as Error).message);
        }
        finally {
            updateLoadingState(false);
        }
    }

    if(loading) return <Loading />;
    else if(isFiltering) return (
        <ForumDetailsModal 
            forumName={ filterObj.forumName } 
            question={ filterObj.question } 
            filter={ masterFilter } 
            close={ () => updateFilterStatus(false) } 
        />
    );

    return (
        <div className="forum-details-container">
            <h1>{ forumName }</h1>

            <button 
                onClick={
                    () => {
                        updateFilter(-1);
                        updateFilteredPosts([]);
                        updateQuestionState(false);
                        updateInference({});
                    } 
                } 
                className="styled-button-dark"
            >
                Reset filters
            </button>

            <button className="grade-button styled-button-dark" onClick={ finalizeGrades }>Download Grades</button>

            {
                updateQuestion ? (
                    <div>
                        <input className="update-question-input" placeholder="Question" type="text" ref={ newQuestion }/>
                        <button className="styled-button-dark" onClick={ testNewQuestion }>Test</button>
                        <button className="styled-button-dark" onClick={ saveNewQuestions }>Save</button>
                    </div>
                ) : null
            }

            {
                inferences ? (
                    inferences.questions.map(
                        (q: string, index: number) => (
                            <h4
                                style={ {color: COLORS[index] }} 
                                key={ index }
                                onClick={ 
                                    () => {
                                        if(window.confirm('Update Question?')) updateQuestionsMaster(index);
                                        else filterQ(index);
                                    } 
                                }
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

                        let postInferences = updateQuestion && newInferences[post.id] ? [newInferences[post.id]] : inferences.inferences[post.id];

                        if(postFilter.length !== 0) console.log(newInferences);

                        let colors = (new Array<string>(post.message.length)).fill('white');

                        for(let i = 0; i < postInferences.length; i++) {
                            let ans = postInferences[i];
                            let startInd = ans.start_ind;
                            let endInd = ans.end_ind;

                            for(let j = startInd; j <= endInd; j++) {
                                colors[j] = updateQuestion && newInferences[post.id] ? COLORS[questionFilter] : COLORS[i];
                            }
                        }

                        for(let i = 0; i < post.message.length; i++) {
                            let c = post.message[i];

                            let qInd = -1;

                            if(colors[i] !== 'white') qInd = COLORS.indexOf(colors[i]);

                            if(qInd !== questionFilter && updateQuestion) colors[i] = 'white'; 

                            postSpans.push(
                                <span 
                                    onClick={ 
                                        () => {
                                            if(colors[i] !== 'white') {
                                                updateFilterObj({
                                                    forumName: post.user_full_name,
                                                    question: inferences.questions[qInd],
                                                    postId: post.id,
                                                    qIndex: qInd
                                                });

                                                updateFilterStatus(true);
                                            }
                                        } 
                                    } 
                                    className={ 
                                        `${colors[i] !== 'white' ? 'answer' : ''} 
                                        ${!updateQuestion && qInd !== questionFilter && questionFilter !== -1 ? 'hidden' : ''}` 
                                    } 
                                    style={ 
                                        {
                                            color: colors[i]
                                        } 
                                    }
                                >
                                    { c }
                                </span>
                            );
                        }

                        return (
                            <div className="post-container"> 
                                <input 
                                    className="check-post" 
                                    type="checkbox" 
                                    disabled={ updateQuestion }
                                    ref={ el => selected.current[post.id] = el }
                                />
                            
                                <div className="post-content-container">
                                    <h2>{ post.user_full_name }</h2>
                            
                                    {
                                        postSpans.map(
                                            (span: any) => span
                                        )
                                    }
                                </div>
                                
                                <div className="post-score-container">
                                    {
                                        inferences.questions.map(
                                            (q: any, i: any) => (
                                                <input 
                                                    type="number" 
                                                    className="post-score" 
                                                    key={ i } 
                                                    placeholder={ `Grade for ${q}` }
                                                    ref={ 
                                                        el => {
                                                            if(!grades.current[post.id]) grades.current[post.id] = new Array<HTMLInputElement>(inferences.questions.length);
                                                            
                                                            grades.current[post.id][i] = el!
                                                        }
                                                    } 
                                                />
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        );
                    }
                )
            }
        </div>
    );
}
