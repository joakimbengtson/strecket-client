import React from 'react';
import {Jumbotron, Button, Grid, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, HelpBlock, Panel, Radio, Checkbox} from 'react-bootstrap';
import Request from 'rest-request';

require('./candidates.less');

const ReactDOM = require('react-dom');

var _inputfield;

module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);
				
		this.url = 'http://app-o.se:3000'; 
		this.api = new Request(this.url);
		
	};
	
	// Virtuell function som anropas då sidan visas
	componentDidMount() {
		var self = this;

	}
		
	
	onCancel() {
		window.history.back();
	}
		
	render() {
		return (
			<div id="candidates">
			Joakim					
			</div>

		);
	};
};
