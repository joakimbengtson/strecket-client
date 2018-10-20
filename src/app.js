import React from 'react';
import ReactDOM from 'react-dom';
import {IndexRoute, hashHistory, Router, Route} from 'react-router';



//import css from '../bootswatch/materia/bootstrap.min.css';
//import css from '../bootstrap/bootstrap.min.css';
//require('./less/styles.less');


var App = React.createClass({
  render: function() {


    return (
		<div className='app'>
			{this.props.children}
    	</div>
    );
  }
})


ReactDOM.render((
	<Router history={hashHistory}>
		<Route path="/" component={App}>

			<IndexRoute component={require('./pages/home/home.js')} />
			<Route path="home"          component={require('./pages/home/home.js')} />
			<Route path="new-stock"         component={require('./pages/new-stock/new-stock.js')} />
			<Route path="candidates"         component={require('./pages/candidates/candidates.js')} />
            <Route path="meg"         component={require('./pages/meg/meg.js')} />

		</Route>
	</Router>
), document.getElementById('app'))
