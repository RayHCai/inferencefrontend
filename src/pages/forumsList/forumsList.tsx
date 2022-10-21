import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../settings';

import { Forum } from '../../components/forum';
import { Loading } from '../../components/loading';

import './forumsList.css';

export function ForumsList() {
    const [forums, updateForums] = useState([] as any[]);
    const [isLoading, updateLoadingState] = useState(true);

    useEffect(() => {
        updateLoadingState(true);

        (async function fetchForums() {
            try {
                let res = await fetch(`${BACKEND_URL}/forums/`);

                if(!res.ok) throw new Error('Error occurred while fetching');

                let forumJson = await res.json();
                
                updateForums(forumJson.data)
            }
            catch(error) {
                alert((error as Error).message);
            }
            finally {
                updateLoadingState(false);
            }
        })();
    }, [])

    if(isLoading) {
        return <Loading />
    }
    
    return (
        <div className="forums-list-container">
            <h1>Forums</h1>

            {
                forums.length > 0 ? (
                    forums.map(
                        (forum, index) => (
                            <Forum 
                                forumId={ forum.id } 
                                name={ forum.name } 
                                key={ index }
                            />
                        )
                    )
                ) : (
                    <h3>
                        No Forums to display. Go <Link to='/addforum'>here</Link> to add one.
                    </h3>
                )
            }
        </div>
    );
}
