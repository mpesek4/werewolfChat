import React from 'react';
import './App.css';
import VideoChat from './VideoChat';

import "@babel/polyfill";

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>Werewolf Chat</h1>
      </header>
      <main>
        <VideoChat />
      </main>
    </div>
  );
};

export default App;
