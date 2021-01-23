import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Switch, Route} from "react-router-dom";

class App extends React.Component {

    render() {
        return (
            <div className='app'>
                {this.props.children}
            </div>
        );

    }
};



ReactDOM.render((
    <HashRouter>
        <App/>
        <Switch>
            <Route exact path="/" component={require('./pages/home/home.js')}/>

            <Route path="/meg" component={require('./pages/meg/meg.js')}/>
            <Route path="/looker" component={require('./pages/looker/looker.js')}/>
            <Route path="/sell-stock" component={require('./pages/sell-stock/sell-stock.js')}/>
            <Route path="/evaluate" component={require('./pages/evaluate/evaluate.js')}/>
            <Route path="/new-stock" component={require('./pages/new-stock/new-stock.js')}/>
            <Route path="/candidates" component={require('./pages/candidates/candidates.js')}/>
            
        </Switch>
    </HashRouter>
), document.getElementById('app'))