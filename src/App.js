import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    Message1,
    Message2
} from "components/Message";
import { connect } from "react-redux";
import { ACTIONS } from "data/store";

const TableOfContentsItemView = ({ path, content, name, type }) => {
    const link = content ?
        <a>Read</a>:
        <p>Not Loaded</p>

    return (
        <li>
            <p>
                <h3>{name}</h3>
                {link}
            </p>
        </li>
    );
};
const TableOfContentsView = ({ chapters = [] }) => {

    const toc = chapters
        .filter(chapter => chapter.type === "file")
        .map(chapter => (
            <TableOfContentsItemView 
                {...chapter}
                key={chapter.path}
            />
        ));

    return (
        <ul>
            {toc} 
        </ul>
    );

};
class AppView extends Component {
    componentWillMount () {

    }
    render() {
        console.log(this.props);
        return (
            <div className="App helvetica">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                </header>
                <TableOfContentsView 
                    chapters={this.props.chapters}
                />
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
