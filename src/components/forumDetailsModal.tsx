import { useState } from 'react';

export function ForumDetailsModal(props: any) {
    const [filterSimilarity, updateFilterStatus] = useState(false);

    const [similarity, updateSimilarity] = useState(0);

    return (
        <div className="forum-details-modal">
            <div className="forum-details-modal-container">
                <button className="styled-button-colored" onClick={ props.close }>X</button>

                <h1>{ props.forumName }</h1>

                <p>{ props.question }</p>

                {
                    !filterSimilarity ? <button className="styled-button-colored similarity-button" onClick={ () => updateFilterStatus(true) }>Filter by Similarity?</button>
                    :
                    <input onChange={ (e:React.ChangeEvent<HTMLInputElement>) => updateSimilarity(e.target.value as any) } step="0.01" type="number" placeholder="Base Similarity" min="0.0" max="1.0" />
                }

                <button className="styled-button-colored" onClick={ () => props.filter(filterSimilarity, similarity) }>Filter</button>
            </div>
        </div>
    );
}