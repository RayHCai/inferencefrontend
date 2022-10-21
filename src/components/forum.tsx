import { useNavigate } from 'react-router-dom';

type forumProps = {
    name: string,
    forumId: string
}

export function Forum(props: forumProps) {
    const navigate = useNavigate();

    function redirectToForum(id: string) {
        navigate(`forum/?forumId=${id}`);
    }

    return (
        <div className="forum-container" onClick={ () => redirectToForum(props.forumId) }>
            <h4>{ props.name }</h4>
        </div>
    );
}
