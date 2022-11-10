import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BACKEND_URL, COLORS } from '../../settings';

import { Loading } from '../../components/loading';
import { ForumDetailsModal } from '../../components/forumDetailsModal';
import { FullForum } from '../../components/fullForum';

import './forumDetails.css';

export function ForumDetails() {
    const [searchParams, _] = useSearchParams();

    const [loading, updateLoadingState] = useState(false);

    const [posts, updatePosts] = useState([]);
    const [forumName, updateForumName] = useState('');
    const [inferences, updateInferences] = useState(null as any);

    const [questionFilter, updateFilter] = useState(-1);
    const [postFilter, updateFilteredPosts] = useState([] as any);

    const [filtering, updateFilterStatus] = useState(false);
    const [filterObj, updateFilterObj] = useState({} as any);

    const [updateQuestionPosts, updateUpdateQuestionsPosts] = useState([] as any);
    const [updateQuestion, updateQuestionState] = useState(false);

    const [newQuestion, updateNewQuestion] = useState('');

    const [newInferences, updateInference] = useState({} as any);

    const [grades, updateGrades] = useState(null as any);

    if(inferences && !grades) {
        let dict: any = {};

        for(let post of posts) {
            dict[(post as any).id] = new Array<any>(inferences.questions.length).fill(0);
        }

        updateGrades(dict);
    }

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
        
        console.log(qIndex);

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

    function masterFilter(filterSimilarity: boolean, similarity: number=0) {
        updateFilterStatus(false);

        if(filterSimilarity) filterBySimilarity(filterObj.postId, filterObj.qIndex, similarity);
        else filterQ(filterObj.qIndex);
    }

    if(filtering) return <ForumDetailsModal forumName={ filterObj.forumName } question={ filterObj.question } filter={ masterFilter } close={ () => updateFilterStatus(false) } />;

    function select(e: React.ChangeEvent<HTMLInputElement>, postId: string) {
        if(e.target.checked) updateUpdateQuestionsPosts([...updateQuestionPosts, postId.toString()]);
        else {
            let i = updateQuestionPosts.indexOf(postId);

            let copy = [...updateQuestionPosts];
            copy.splice(i, 1);
            updateUpdateQuestionsPosts(copy);
        }
    }

    function updateQuestionsMaster(index: number) {
        if(updateQuestionPosts.length === 0) return alert('No posts to check against. Please select at least one post.');
        
        updateQuestionState(true);
        updateFilter(index);
        updateFilteredPosts(updateQuestionPosts);
    }

    function testNewQuestion() {
        updateLoadingState(true);
        
        try {
            (async function() {
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
                        question: newQuestion,
                        forum_id: searchParams.get('forumId'),
                        post_ids: JSON.stringify(updateQuestionPosts)
                    })
                });
                
                let newJson = await newRes.json();
                
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

    function grade(e: React.ChangeEvent<HTMLInputElement>, i: number, postId: string) {
        let copy = {...grades};

        copy[postId][i] = Number(e.target.value);

        updateGrades(copy);
    }

    function finalizeGrades() {
        let jsonGrades = JSON.stringify(grades);

        let a = window.document.createElement('a');

        a.href = window.URL.createObjectURL(new Blob([jsonGrades], {type: 'application/json'}));
        a.download = `${forumName}-grades.json`;

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();

        // Remove anchor from body
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
                        forum_id: searchParams.get('forumId'),
                        questions: cleanedQuestions
                    })
                });

                if(!inferencesRes.ok) throw new Error('Error occurred while creating inferences');
                else {
                    window.location.reload();
                }
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

    return (
        <div className="forum-details-container">
            <h1>{ forumName }</h1>

            <button 
                onClick={
                    () => {
                        updateFilter(-1);
                        updateFilteredPosts([]);
                        updateQuestionState(false);
                        updateUpdateQuestionsPosts([]);
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
                        <input className="update-question-input" placeholder="Question" type="text" onChange={ (e) => updateNewQuestion(e.target.value) }/>
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
                                onClick={ () => {
                                    if(window.confirm('Update Question?')) updateQuestionsMaster(index);
                                    else filterQ(index);
                                } }
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
                            <FullForum grade={ grade } questions={ inferences.questions } updatingQuestion={ updateQuestion } userFullname={ post.user_full_name } select={ select } postSpans={ postSpans } postId={ post.id } />
                        );
                    }
                )
            }
        </div>
    );
}
