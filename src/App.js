import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    Message1,
    Message2
} from "components/Message";
import { connect } from "react-redux";
import { Link, Route, Redirect } from "react-router-dom";
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

const TOC = ( { chapters, toc } ) => {


      const $chapters = toc.map( chapter => {

        const idx = chapter.path;
        const data = chapters[idx];
        const link = data ? <Link to={data.path}>{data.path}</Link> 
          : null;
        return (
          <li key={chapter.path}>
            <p>{chapter.name}</p>
            <p>{data ? data.path : "lol"}</p>
            {link}
          </li>
        );
      });

      return (
        <div className="App helvetica">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
          </header>
          <ul>
            {
              $chapters
            }
          </ul>
        </div>
      );

};
class AppView extends Component {
    componentWillMount () {

    }
    render() {

      const has = chapter => !!this.props.chapters[chapter.path];

      console.log("lol");
      return (
        <section>
          <Route
            path="/:chapter*"
          >
            {({ match, location }) => {
              if ( !match ) return null;
              const c = match.params.chapter.split("/").pop();
              if ( has(c) ) {
                return (
                  <section>lol</section>
                );
              } else {
                return <Redirect to="/404"/>;
              }
            }}
          </Route>
          <TOC 
            chapters={this.props.chapters}
            toc={this.props.toc}
          />
        </section>
      );

    }
}

const App = connect(
  state => {
    return  {
      ...state.book
    };
  },
    {
        load() {
            return {
                type: ACTIONS.load
            };
        }
    }
)(AppView);
export default App;
