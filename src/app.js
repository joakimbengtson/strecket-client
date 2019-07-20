import React from 'react';
import ReactDOM from 'react-dom';
import {IndexRoute, hashHistory, Router, Route} from 'react-router';
/*

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.3/cerulean/bootstrap.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.3/flatly/bootstrap.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.3/cyborg/bootstrap.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.3/materia/bootstrap.css" crossorigin="anonymous">

*/

//import css from '../bootswatch/flatly/bootstrap.css';
//import css from '../bootswatch/cerulean/bootstrap.min.css';
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
			<Route path="home"        component={require('./pages/home/home.js')} />
			<Route path="new-stock"   component={require('./pages/new-stock/new-stock.js')} />
			<Route path="sell-stock"  component={require('./pages/sell-stock/sell-stock.js')} />			
			<Route path="candidates"  component={require('./pages/candidates/candidates.js')} />
			<Route path="evaluate"    component={require('./pages/evaluate/evaluate.js')} />
            <Route path="meg"         component={require('./pages/meg/meg.js')} />

		</Route>
	</Router>
), document.getElementById('app'))
