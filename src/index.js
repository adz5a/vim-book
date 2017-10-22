import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "tachyons";
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from "react-redux";
import { store } from "data/store";

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById('root'));
registerServiceWorker();
