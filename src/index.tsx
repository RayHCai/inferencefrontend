import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ForumsList } from './pages/forumsList/forumsList';
import { AddForum } from './pages/addForum/addForum';
import { ForumDetails } from './pages/forumdetails/forumDetails';
import { PageNotFound } from './pages/pageNotFound/pageNotFound';

import { Navbar } from './components/navbar';

import './main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      
      <Routes>
        <Route path='/' element={ < ForumsList/> } />
        <Route path='/addforum' element={ <AddForum/> }/>
        <Route path='/forum' element={ <ForumDetails /> } />
  
        <Route path='*' element={ <PageNotFound /> } />
      </Routes>
    </BrowserRouter>    
  </React.StrictMode>
);
