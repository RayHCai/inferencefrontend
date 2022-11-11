import { BACKEND_URL } from './settings';

export async function createInferences(forumId: string, questions: string[]) {
    return await fetch(`${BACKEND_URL}/foruminference/`, {
        method: 'POST',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            forum_id: forumId,
            questions: questions
        })
    });
}
