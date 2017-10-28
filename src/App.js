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
import findIndex from "lodash/findIndex";


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


const Next = ( { href } ) => {
  return (
    <Link to={href}>Next</Link>
  )
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
                const { name } = match.params;
                const { chapters, toc } = this.props;
                const index = findIndex(toc, c => c.name === name);
                  const chapter = chapters[name];

                if ( index > -1 && chapter ) {

                  const nextHref = index + 1 >= toc.length ?
                    "/" :
                    toc[index + 1].path;

                  return (
                    <section className="pl3 pr3">
                      <h1>{chapter.name}</h1>
                      <Next href={"/" + nextHref}/>
                      <Markdown source={atob(chapter.content)} />
                      <Next href={"/" + nextHref}/>
                    </section>
                  );

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
