import { useState } from 'react';

import calvinLogo from '../assets/calvinLogo.svg';

export function Navbar() {
    const [isNavOpen, updateNavState] = useState(false);

    const links = [
        {
            url: '/',
            text: 'Forums'
        },
        {
            url: '/addforum',
            text: 'Add Forum'
        }
    ];

    return (
        <div className="navbar">
            <img 
                className={ isNavOpen ? 'calvin-logo-nav-open' : '' } 
                onClick={ 
                    () => updateNavState(!isNavOpen) 
                } 
                src={ calvinLogo } 
                alt="Calvin University Logo" 
            />

            {
                isNavOpen ? (
                    <div className="navbar-links-container">
                        <div>
                            {
                                links.map(
                                    (link, index) => (
                                        <a 
                                            key={ index } 
                                            href={ link.url }
                                        >
                                            { link.text }
                                        </a>
                                    )
                                )
                            }
                        </div>
                    </div>
                ) : null
            }
        </div>
    );
}
