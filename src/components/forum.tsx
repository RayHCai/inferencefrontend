import { useNavigate } from 'react-router-dom';

type forumProps = {
    name: string,
    forumId: string
}

export function Forum(props: forumProps) {
    const navigate = useNavigate();

    return (
        <div 
            className="forum-container" 
            onClick={ 
                () => navigate(`forum/?forumId=${props.forumId}`)
            }
        >
            <h4>{ props.name }</h4>
        </div>
    );
}
