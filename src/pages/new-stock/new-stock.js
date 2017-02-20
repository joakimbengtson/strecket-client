import React from 'react';
import {Jumbotron, Button, Grid, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, HelpBlock, Panel, Radio, Checkbox} from 'react-bootstrap';
import Request from 'rest-request';

require('./new-stock.less');

const ReactDOM = require('react-dom');

var _inputfield;

var _ATR;

var _stoplossType = {
    StoplossTypeATR : 1,
    StoplossTypeQuote : 2,
    StoplossTypePercent : 3
}

var _percentile10 = false;

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);

		this.url = 'http://app-o.se:3000';
		this.api = new Request(this.url);
		
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleOptionChange = this.handleOptionChange.bind(this);

		this.state = {helptext:'', selectedOption: 'option1'};
		
	};

	handleCheckChange(changeEvent) {
		_percentile10 = !_percentile10;
	}
	
	handleOptionChange(changeEvent) {
		this.setState({selectedOption: changeEvent.target.value});
		
		if (changeEvent.target.value == 'option1')
			ReactDOM.findDOMNode(this.refs.ATRMultiple).focus();
		else if (changeEvent.target.value == 'option2')
			ReactDOM.findDOMNode(this.refs.stoplossQuote).focus();
		else
			ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();		
	}
	
	// Virtuell function som anropas då sidan visas
	componentDidMount() {
		// Sätt fokus på första fältet
		ReactDOM.findDOMNode(this.refs.stockticker).focus(); 
		_inputfield = ReactDOM.findDOMNode(this.refs.stockname);
	}
		
	onSave() {
		var rec = {};	
		var today = new Date();	
		
		// ---- VALIDATE
		
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
			ReactDOM.findDOMNode(this.refs.stockcount).focus(); 
			return;			
		}
		
		if (this.state.selectedOption == 'option1') {
			if (!(ReactDOM.findDOMNode(this.refs.ATRMultiple).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.ATRMultiple).value))) {
				ReactDOM.findDOMNode(this.refs.ATRMultiple).focus(); 
				return;			
			}
		}
		else if (this.state.selectedOption == 'option2') {
			if (!(ReactDOM.findDOMNode(this.refs.stoplossQuote).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.stoplossQuote).value))) {
				ReactDOM.findDOMNode(this.refs.stoplossQuote).focus(); 
				return;			
			}
		}
		else {
			if (!ReactDOM.findDOMNode(this.refs.stoplossPercentage).value.length > 0) {
				ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus(); 
				return;			
			}
			else if (isNumeric(ReactDOM.findDOMNode(this.refs.stoplossPercentage).value)) {
				var val = ReactDOM.findDOMNode(this.refs.stoplossPercentage).value;
				
				if (val > 25) {
					ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();  
					return;												
				}
			}
			else {
				ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus(); 
				return;							
			}
		}
				

		// ---- SAVE
		
		var request = require("client-request");

		rec.ticker = ReactDOM.findDOMNode(this.refs.stockticker).value;
		rec.namn = ReactDOM.findDOMNode(this.refs.stockname).value;
		rec.kurs = ReactDOM.findDOMNode(this.refs.stockprice).value;
		rec.antal = ReactDOM.findDOMNode(this.refs.stockcount).value;
		
		if (this.state.selectedOption == 'option1') {
			rec.stoplossTyp = _stoplossType.StoplossTypeATR;
			rec.ATRMultipel = ReactDOM.findDOMNode(this.refs.ATRMultiple).value;		
		}
		else if (this.state.selectedOption == 'option2') {
			rec.stoplossTyp = _stoplossType.StoplossTypeQuote;
			rec.stoplossKurs = ReactDOM.findDOMNode(this.refs.stoplossQuote).value;		
			
		}
		else {
			rec.stoplossTyp = _stoplossType.StoplossTypePercent;
			rec.stoplossProcent = ReactDOM.findDOMNode(this.refs.stoplossPercentage).value/100;			
		}
		
		rec.percentil10 = _percentile10;
		
		rec.ATR = _ATR;		

		var options = {
		  uri: "http://app-o.se:3000/save",
		  method: "POST",
		  body: rec,
		  timeout: 3000,
		  json: true,
		   headers: {
		    "content-type": "application/json" 
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
			var ticker = target.currentTarget.value;
	
			var options = {
			  uri: "http://app-o.se:3000/company/" + ticker,
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

					options = {
					  uri: "http://app-o.se:3000/atr/" + ticker,
					  method: "GET",
					  timeout: 1000,
					  json: true,
					   headers: {
					    "content-type": "application/json"   // setting headers is up to *you* 
					  }
					};
					
					var req = request(options, function(err, response, body) {
						if (!err) {
							var helpStr;
							
							helpStr = "(ATR = " + body.atr.toFixed(2) + " ATR % = " + body.atrPercent + "%)";
							_ATR = body.atr;

							self.setState({helptext: helpStr});		
							ReactDOM.findDOMNode(self.refs.stockprice).focus();
						}				
			 		});

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
					    
					    
					    <Col sm={7} smOffset={2}>
					    <ControlLabel>Stop loss</ControlLabel>
					    <Row>
					    <Col sm={2}>
						<Radio   value="option1" checked={this.state.selectedOption === 'option1'} onChange={this.handleOptionChange}>
						&nbsp;&nbsp;släpande 
						</Radio>
						</Col>
					    <Col sm={2}>						
						<FormControl type="text" ref='ATRMultiple' placeholder="x ATR?" />
						</Col>
					    <Col sm={4}>						
						<ControlLabel ref='stoplosshelper'><span style={{color:'#b2b2b2'}}>{this.state.helptext}</span></ControlLabel>
						</Col>
						</Row>

					    <Row>
					    <Col sm={2}>						
						<Radio   value="option2" checked={this.state.selectedOption === 'option2'} onChange={this.handleOptionChange}>
						&nbsp;&nbsp;under kurs 
						</Radio>
						</Col>
					    <Col sm={2}>												
						<FormControl type="text" ref='stoplossQuote' placeholder="Kurs?" />
						</Col>
						</Row>
						
						<Row>
					    <Col sm={3}>						
						<Radio   value="option3" checked={this.state.selectedOption === 'option3'} onChange={this.handleOptionChange}>
						&nbsp;&nbsp;släpande under procent 
						</Radio>
						</Col>
					    <Col sm={2}>						
						<FormControl type="text" ref='stoplossPercentage' placeholder="%" />
						</Col>
						</Row>
						
						<br/>
						
						<Checkbox ref='percentile10' onChange={this.handleCheckChange}>
						&nbsp;&nbsp;öka stop loss med 1% för varje 10%-ökning av kursen
						</Checkbox>
						
					    </Col>

						<FormGroup>
					    <Col sm={10} smOffset={1}>
						<br/>
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
