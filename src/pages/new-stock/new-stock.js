import React from 'react';
import {Jumbotron, Button, Grid, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Request from 'rest-request';

require('./new-stock.less');

const ReactDOM = require('react-dom');

var _inputfield;

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);

		this.url = 'http://app-o.se:3000';
		//this.url = 'http://localhost:3000';
		this.api = new Request(this.url);

		this.state = {};
		
	};
	
	// Virtuell function som anropas då sidan visas
	componentDidMount() {
		// Sätt fokus på första fältet
		ReactDOM.findDOMNode(this.refs.stockticker).focus(); 
		_inputfield = ReactDOM.findDOMNode(this.refs.stockname);
	}
		
	onSave() {
		var rec = {};		
		
		if (ReactDOM.findDOMNode(this.refs.stockticker).value.length == 0) {
			ReactDOM.findDOMNode(this.refs.stockticker).focus(); 
			return;			
		}

		if (ReactDOM.findDOMNode(this.refs.stockname).value.length == 0) {
			ReactDOM.findDOMNode(this.refs.stockname).focus(); 
			return;			
		}

		if (!(ReactDOM.findDOMNode(this.refs.stockprice).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.stockprice).value))) {
			ReactDOM.findDOMNode(this.refs.stockprice).focus(); 
			return;			
		}

		if (!(ReactDOM.findDOMNode(this.refs.stockcount).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.stockcount).value))) {
			ReactDOM.findDOMNode(this.refs.stockprice).focus(); 
			return;			
		}

		if (ReactDOM.findDOMNode(this.refs.stockstoploss).value.length > 0) {
			// Om egen stop loss angiven, måste vara numerisk och mellan 1-20%
			if (!isNumeric(ReactDOM.findDOMNode(this.refs.stockstoploss).value)) {
				ReactDOM.findDOMNode(this.refs.stockstoploss).focus(); 
				return;				
			}
			if (ReactDOM.findDOMNode(this.refs.stockstoploss).value < 1 || ReactDOM.findDOMNode(this.refs.stockstoploss).value > 20) {
				ReactDOM.findDOMNode(this.refs.stockstoploss).focus(); 
				return;				
			}
		}

		
		var request = require("client-request");

		rec.ticker = ReactDOM.findDOMNode(this.refs.stockticker).value;
		rec.namn = ReactDOM.findDOMNode(this.refs.stockname).value;
		rec.kurs = ReactDOM.findDOMNode(this.refs.stockprice).value;
		rec.antal = ReactDOM.findDOMNode(this.refs.stockcount).value;
		rec.stoploss = ReactDOM.findDOMNode(this.refs.stockstoploss).value/100;

		var options = {
		  //uri: "http://localhost:3000/save",
		  uri: "http://app-o.se:3000/save",
		  method: "POST",
		  body: rec,
		  timeout: 3000,
		  json: true,
		   headers: {
		    "content-type": "application/json"   // setting headers is up to *you* 
		  }
		};
		
		var req = request(options, function callback(err, response, body) {
						
			if (err) {
				console.log(err);
			}
			
			window.history.back();		    
		});

	}
	
	onCancel() {
		window.history.back();
	}

	handleKeyDown(target) {
		// Tillåt inte ','
		if (target.keyCode == 188)
			target.preventDefault();	
	}

	handleKeyPress(target) {
		// Kolla att tickern finns
		if (target.key == 'Enter') {
			var self = this;
			
			var request = require("client-request");
	
			var options = {
			  uri: "http://app-o.se:3000/company/" + target.currentTarget.value,
			  method: "GET",
			  timeout: 1000,
			  json: true,
			   headers: {
			    "content-type": "application/json"   // setting headers is up to *you* 
			  }
			};
			
			var req = request(options, function(err, response, body) {
				if (!err) {
					_inputfield.value = body; // Sätt aktienamnet automatiskt
				}				
	 		});
	 		
	 	}
	}	
	
	
	render() {

		return (
			<div id="new_stock">
					
				<Col sm={10} smOffset={1} md={8} mdOffset={2}>
					
					<Form horizontal>

					    <Col sm={10} smOffset={1}>
							<PageHeader>Ny aktie</PageHeader>
						</Col>
					  
					    <FormGroup controlId="stock_ticker">
					      <Col componentClass={ControlLabel} sm={2}>
					        Ticker
					      </Col>
					      <Col sm={4}>
					        <FormControl type="text" ref='stockticker' placeholder="Kortnamn för aktien" onKeyPress={this.handleKeyPress}/>
					      </Col>
					    </FormGroup>

					    <FormGroup controlId="stock_name">
					      <Col componentClass={ControlLabel} sm={2}>
					        Namn
					      </Col>
					      <Col sm={10}>
					        <FormControl type="text" ref='stockname' placeholder="Namnet på aktien" />
					      </Col>
					    </FormGroup>
					
					    <FormGroup controlId="stock_price">
					      <Col componentClass={ControlLabel} sm={2}>
					        Kurs
					      </Col>
					      <Col sm={2}>
					        <FormControl type="text" ref='stockprice' placeholder="Köpt till kursen?" onKeyDown={this.handleKeyDown}/>
					      </Col>
					    </FormGroup>

					    <FormGroup controlId="stock_count">
					      <Col componentClass={ControlLabel} sm={2}>
					        Antal
					      </Col>
					      <Col sm={2}>
					        <FormControl type="text" ref='stockcount' placeholder="Antal aktier" />
					      </Col>
					    </FormGroup>

					    <FormGroup controlId="stock_stoploss">
					      <Col componentClass={ControlLabel} sm={2}>
					        Släpande stop loss
					      </Col>
					      <Col sm={2}>
					        <FormControl type="text" ref='stockstoploss' placeholder="Släpande stop loss i %" />
					      </Col>
					    </FormGroup>


						<FormGroup>
					    <Col sm={10} smOffset={1}>

						<ButtonToolbar>

							<Button onClick={this.onCancel.bind(this)}>
							  Avbryt
							</Button>
							
							<Button bsStyle='success' onClick={this.onSave.bind(this)}>
							  Spara
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
