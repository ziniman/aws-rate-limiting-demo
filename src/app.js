import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// Components
import Home from './components/index';
import Master from './components/master';
import Error404 from '.Error404';

class App extends Component {
  render() {
    return (
       <BrowserRouter>
        <div>
          <Navigation />
            <Switch>
             <Route path="/" component={Home} exact/>
             <Route path="/master" component={Master}/>
             <Route component={Error404}/>
           </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
