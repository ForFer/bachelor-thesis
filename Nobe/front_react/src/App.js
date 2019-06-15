import React, { Component } from 'react';
import Landing from './components/landing'
import Login from './components/login'
import Profile from './components/profile'
import Search from './components/search'
import { BrowserRouter, Route } from 'react-router-dom';

import './static/common.css';

class App extends Component {
  render() {
    let base_url = 'http://127.0.0.1:8000'

    return (
      <BrowserRouter>

        <div className="App height_100">
          <Route exact path='/' 
            render={(routeProps) => (<Landing {...routeProps} base_url={base_url} /> ) } />

          <Route exact path='/login' 
            render={(routeProps) => (<Login {...routeProps} base_url={base_url} /> ) } />

          <Route exact path='/profile' 
            render={(routeProps) => (<Profile {...routeProps} base_url={base_url} /> ) } />
          

          <Route exact path='/search'
            render={(routeProps) => (<Search {...routeProps} base_url={base_url} /> ) } />
         </div>
      </BrowserRouter>
    );
  }
}

export default App;
