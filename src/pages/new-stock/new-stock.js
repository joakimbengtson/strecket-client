import React from 'react';
import {Jumbotron, Button, Grid, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Request from 'rest-request';

require('./new-stock.less');

const ReactDOM = require('react-dom');


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
		
		var request = require("client-request");

		rec.ticker = ReactDOM.findDOMNode(this.refs.stockticker).value;
		rec.namn = ReactDOM.findDOMNode(this.refs.stockname).value;
		rec.kurs = ReactDOM.findDOMNode(this.refs.stockprice).value;
		rec.antal = ReactDOM.findDOMNode(this.refs.stockcount).value;

		var options = {
		  //uri: "http://localhost:3000/save",
		  uri: "http://app-o.se:3000/save",
		  method: "POST",
		  body: rec,
		  timeout: 1000,
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

/*

   var headers =  {
    "content-type": "application/json"   // setting headers is up to *you* 
  };
			
		
		
		this.api.post('save', blubba, headers).then(function(response) {
			window.history.back();
		})
		
*/

	}
	
	onCancel() {
		window.history.back();
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
					        <FormControl type="text" ref='stockticker' placeholder="Kortnamn för aktien" />
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
					        <FormControl type="text" ref='stockprice' placeholder="Köpt till kursen?" />
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
