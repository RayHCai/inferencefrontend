import { useNavigate } from 'react-router-dom';

import './pageNotFound.css';

export function PageNotFound() {
    let navigate = useNavigate();
    
    return (
        <div className="page-not-found-container">
            <div className="pnf-letters-container">
                4<span>0</span>4
            </div>

            <p>We can't find the page you're looking for.</p>

            <button 
                className="styled-button-colored" 
                onClick={
                    () => navigate('/') 
                }
            >
                Go back home
            </button>
        </div>
    );
}
