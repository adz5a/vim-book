import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    Message1,
    Message2
} from "components/Message";
import { connect } from "react-redux";
import { ACTIONS } from "data/store";

class AppView extends Component {
    componentWillMount () {

        this.props.load();

    }
    render() {
        console.log(this.props);
        return (
            <div className="App helvetica">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                </header>
            </div>
        );
    }
}

const App = connect(
    state => state.book,
    {
        load() {
            return {
                type: ACTIONS.load
            };
        }
    }
)(AppView);
export default App;
