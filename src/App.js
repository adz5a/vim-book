import React, { Component } from 'react';
import logo from './logo.svg';
import {
    Message1,
    Message2
} from "components/Message";
import { connect } from "react-redux";
import { Link, Route, Redirect } from "react-router-dom";
import { ACTIONS } from "data/store";
import Markdown from "react-markdown";


const TocView = ( { toc } ) => {
  const chapters = toc
    .filter(chapter => chapter.type === "file")
    .map(chapter => (
      <li
        key={chapter.path}
      >
        <Link 
          to={"/" + chapter.path}
        >
          {chapter.name}
        </Link>
    </li>
    ));

  return (
    <ol className="list">
      {chapters} 
    </ol>
  );
};

const Toc = connect(
  state => ({
    toc: state.book.toc
  })
)(TocView);


const ChapterView = ( { chapter } ) => {

  return (
    <section className="pl2 pr2">
      <h1>{chapter.name}</h1>
      <Markdown source={atob(chapter.content)} />
    </section>
  );


};

class AppView extends Component {
    componentWillMount () {

    }
    render() {

      return (
        <section className="helvetica flex">
          <Route
            path="/"
            component={Toc}
          />
          <Route
            path="/chapters/:name"

          >
            {({ match, location }) => {

              if ( match ) {
                const name = match.params.name
                if ( this.props.chapters[name] ) {

                  return <ChapterView
                    chapter={this.props.chapters[match.params.name]}
                  />;

                } else {
                  return (
                    <section>
                      not found
                    </section>
                  );
                }
              } else {
                return (
                  <section>
                    Select a chapter
                  </section>
                );
              }

            }}
          </Route>
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
