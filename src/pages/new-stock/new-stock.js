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
	
	onSave() {
		window.history.back();
	}

	onCancel() {
		window.history.back();
	}

	render() {
		var style = {};

		return (
			<div id="new_stock">
					
				<Col sm={10} smOffset={1} md={8} mdOffset={2}>
					
					<Form horizontal>

					    <Col sm={10} smOffset={1}>
							<PageHeader>Ny aktie</PageHeader>
						</Col>
					  
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

						<FormGroup>
					    <Col sm={10} smOffset={1}>

						<ButtonToolbar>

							<Button bsStyle='success' onClick={this.onSave.bind(this)}>
							  Spara
							</Button>
							
							<Button onClick={this.onCancel.bind(this)}>
							  Avbryt
							</Button>
						</ButtonToolbar>		
						</Col>			
					    </FormGroup>				
					
					</Form>
					
				</Col>
				
			</div>

		);
	};
};
