import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Navbar } from './components/navbar';

import { ForumsList } from './pages/forumsList/forumsList';
import { AddForum } from './pages/addForum/addForum';
import { ForumDetails } from './pages/forumdetails/forumDetails';
import { PageNotFound } from './pages/pageNotFound/pageNotFound';

import './main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <Navbar />
      
      <Routes>
        <Route path='/' element={ < ForumsList/> } />
        <Route path='/addforum' element={ <AddForum/> }/>
        <Route path='/forum' element={ <ForumDetails /> } />

        <Route path='*' element={ <PageNotFound /> } />
      </Routes>
    </Router>    
  </React.StrictMode>
);
