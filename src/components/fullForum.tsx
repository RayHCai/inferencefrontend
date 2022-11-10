export function FullForum(props: any) {
    return (
        <div className="post-container">
            {
                !props.updatingQuestion ? <input className="check-post" type="checkbox" onChange={ (e) => props.select(e, props.postId) } /> : null
            }
            

            <div className="post-content-container">
                <h2>{ props.userFullname }</h2>

                {
                    props.postSpans.map(
                        (sp: any) => sp
                    )
                }
            </div>

            <div className="post-score-container">
                {
                    props.questions.map(
                        (q: any, i: any) => <input onChange={ (e) => props.grade(e, i, props.postId) } type="number" className="post-score" key={ i } placeholder={ `Grade for ${q}` } />
                    )
                }
            </div>
                   
        </div>
    );   
}