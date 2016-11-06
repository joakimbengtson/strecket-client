import React from 'react';
import {Jumbotron, Button, Grid, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Request from 'rest-request';

require('./new-stock.less');

const ReactDOM = require('react-dom');

module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
		
	};
	
	// Virtuell function som anropas då sidan visas
	componentDidMount() {
		// Sätt fokus på första fältet
		ReactDOM.findDOMNode(this.refs.stockname).focus(); 
	}

	render() {
		var style = {};

		return (
			<div id="new_stock">
					
				<Col sm={10} smOffset={1} md={8} mdOffset={2}>

					<PageHeader>Ny aktie</PageHeader>
					
					<Form horizontal>
					  
					    <FormGroup controlId="stock_name">
					      <Col componentClass={ControlLabel} sm={2}>
					        Namn
					      </Col>
					      <Col sm={10}>
					        <FormControl type="text" ref='stockname' placeholder="Namnet på aktien" />
					      </Col>
					    </FormGroup>
					
					    <FormGroup controlId="stock_ticker">
					      <Col componentClass={ControlLabel} sm={2}>
					        Ticker
					      </Col>
					      <Col sm={4}>
					        <FormControl type="text" placeholder="Kortnamn för aktien" />
					      </Col>
					    </FormGroup>

					    <FormGroup controlId="stock_count">
					      <Col componentClass={ControlLabel} sm={2}>
					        Antal
					      </Col>
					      <Col sm={2}>
					        <FormControl type="text" placeholder="Hur många?" />
					      </Col>
					    </FormGroup>

					    <FormGroup controlId="stock_price">
					      <Col componentClass={ControlLabel} sm={2}>
					        Kurs
					      </Col>
					      <Col sm={2}>
					        <FormControl type="text" placeholder="Köpt till kursen?" />
					      </Col>
					    </FormGroup>
					
					</Form>
				
					<ButtonToolbar>

						<Button bsStyle='success' href='#new-stock'>
						  Spara
						</Button>
						
						<Button href='#new-stock'>
						  Avbryt
						</Button>

					</ButtonToolbar>					
	
				</Col>
				
			</div>

		);
	};
};
