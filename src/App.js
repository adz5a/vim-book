import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    Message1,
    Message2
} from "components/Message";

class App extends Component {
  render() {
    return (
      <div className="App helvetica">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro b">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Message1 
            message="world"
        />
        <Message2 
            message="cruel world"
        />
      </div>
    );
  }
}

export default App;
