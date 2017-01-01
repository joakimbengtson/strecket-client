import React from 'react';
import {Button, Grid, Row, Col, Glyphicon} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader, Table, thead, td, tr, th, Label, OverlayTrigger, Popover} from 'react-bootstrap';
require('./home.less');


module.exports = class Home extends React.Component {
	
	constructor(props) {
		super(props);

		this.state = {stocks:[], error:''}; 

	};

	componentDidMount() {
		this.fetchStocks();
	}


	deleteStock(id) {
		var self = this;

		console.log('Raderar aktie ' + id);		
	
		var request = require("client-request");


		var options = {
		  //uri: "http://localhost:3000/stocks/" + id,
		  uri: "http://app-o.se:3000/stocks/" + id,
		  method: "DELETE",
		  timeout: 3000,
		  json: true,
		   headers: {
		    "content-type": "application/json"   // setting headers is up to *you* 
		  }
		};
		
		var req = request(options, function(err, response, body) {

			if (!err) {
				self.fetchStocks();
			}
			else
				console.log(err);				
			
 		});


	}
	

	fetchStocks() {
		var self = this;

		console.log('Hämtar aktiekurser...');

		var request = require("client-request");


		var options = {
			//uri: "http://localhost:3000/stocks",
		  uri: "http://app-o.se:3000/stocks",
		  method: "GET",
		  json: true,
		   headers: {
		    "content-type": "application/json"   // setting headers is up to *you* 
		  }
		};
		
		var req = request(options, function(err, response, body) {

			if (!err) {
				self.setState({stocks:body});
			}
			else {
				self.setState({error:err});				
				console.log(err);				
			}
 		});
	};
	
	
	getColor(percentage) {
		const green5 = {backgroundColor: '#00610e'};
		const green4 = {backgroundColor: '#3d860b'};
		const green3 = {backgroundColor: '#34a203'};
		const green2 = {backgroundColor: '#6ec007'};
		const green1 = {backgroundColor: '#c1d11f'};
		const red1 = {backgroundColor: '#ffb5b5'};
		const red2 = {backgroundColor: '#ff9393'};
		const red3 = {backgroundColor: '#ff6a6a'};
		const red4 = {backgroundColor: '#ff3e3e'};
		const red5 = {backgroundColor: '#ff2d2d'};	
		
		var p = parseFloat(percentage);

		if (p > 20)
			return green5;
			
		if (p > 15)
			return green4;
				
		if (p > 10)
			return green3;
				
		if (p > 5)
			return green2;
				
		if (p > 0)
			return green1;

		if (p > -5)
			return red1;
			
		if (p > -10)
			return red2;
			
		if (p > -15)
			return red3;
			
		if (p > -20)
			return red4;			
		else
			return red5;										

	};

	renderStocks() {
		var self = this;
		
		var items = this.state.stocks.map(function(stock, index) {
			
			if (stock.ticker == 'xxx') {
				return (<tr key={index}><td colSpan="8"><center>{stock.namn}</center></td></tr>);
			}
			else {
				return (
					<tr key={index}>
					<OverlayTrigger trigger="click" placement="top" overlay={<Popover id="popover-positioned-top" title="Företag">{stock.namn}</Popover>}><td>{stock.ticker}</td></OverlayTrigger>
					<td>{parseFloat(stock.senaste).toFixed(2)}<span style={{color:'#b2b2b2'}}> ({parseFloat(stock.kurs).toFixed(2)})</span></td>
					<td style={{textAlign:'right'}}>{stock.utfall}</td>
					<td style={{color:'#b2b2b2',textAlign:'right'}}>{parseFloat((1-(stock.kurs/stock.maxkurs))*100).toFixed(2)}</td>					
					<td style={self.getColor(parseFloat((1-(stock.sma50/stock.senaste))*100).toFixed(2))}>{}</td>					
					<td style={self.getColor(parseFloat((1-(stock.sma200/stock.senaste))*100).toFixed(2))}>{}</td>					
					{stock.larm == 1 ? <td><center><Label bsStyle="danger">Larm</Label></center></td> : stock.flyger == 1 ? <td><center><Label bsStyle="info">Flyger</Label></center></td> : <td></td>}
					<td><center><Button bsSize="xsmall" bsStyle="link" onClick={self.deleteStock.bind(self, stock.id)}>Sälj</Button></center></td>
					</tr>
				);				
			}
						
		});

		if (items.length == 0) {
			if (this.state.error)
				var items = <tr><td colSpan="8"><center>{'Kan inte nå servern: ' + self.state.error.message}</center></td></tr>			
			else
				var items = <tr><td colSpan="8"><center>{'Inga aktier'}</center></td></tr>
		}
				
		return(
			<Table striped={true} bordered={true} condensed={true} responsive={true}>
			
		    <thead>
		      <tr>
		        <th>Ticker</th>
		        <th>Kurs</th>
		        <th style={{textAlign:'right'}}>%</th>
		        <th style={{textAlign:'right'}}>%max</th>
		        <th>ma50 </th>		        
		        <th>ma200</th>
		        <th></th>
		        <th></th>		        
		      </tr>
		    </thead>
		    
		    <tbody>
				{items}
			</tbody>
			</Table>
			
		);
		
	}


	render() {

		return (
			
			<div id="home">
				<Grid>
					<Row>
						<br/>
					</Row>
					<Row>
						<Col sm={10} smOffset={1} md={8} mdOffset={2}>
						
							<Row>
								<Col sm={10} smOffset={1} md={10} mdOffset={2}>
									{this.renderStocks()}
								</Col>
							</Row>						
							  
							<br/>
							  
							<p>
							  <Button bsStyle='success' bsSize='large' href='#new-stock'>
								  Nytt köp
							  </Button>
							</p>
							  
						</Col>
					</Row>
				</Grid>
			</div>

		);
	};
};
