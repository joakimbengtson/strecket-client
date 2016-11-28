import React from 'react';
import {Button, Grid, Row, Col, Glyphicon} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader, Table, thead, td, tr, th, Label} from 'react-bootstrap';
require('./home.less');


module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);

		this.state = {stocks:[], error:''}; 

	};

	// Virtuell function som anropas då sidan visas
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
		  timeout: 1000,
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
	}

/*	
		var items = this.state.stocks.map(function(stock, index) {
			return (
				<tr key={index}>
				<td>{stock.namn}</td> 
				<td>{stock.ticker}</td>
				<td>{stock.kurs}</td>
				<td>{stock.senaste}</td>
				<td>{stock.utfall}</td>
				{stock.larm == 1 ? <td><center><Label bsStyle="danger">Larm</Label></center></td> : stock.flyger == 1 ? <td><center><Label bsStyle="success">Flyger</Label></center></td> : <td></td>}
				<td><center><Button bsStyle="danger" bsSize="xsmall" onClick={self.deleteStock.bind(self, stock.id)}>Radera</Button></center></td> 
				</tr>
			);
		});
*/

	
	renderStocks() {
		var self = this;

		var items = this.state.stocks.map(function(stock, index) {
			
			if (stock.ticker == 'xxx') {
				return (<tr key={index}><td colSpan="7"><center>{stock.namn}</center></td></tr>);
			}
			else {
				return (
					<tr key={index}>
					<td>{stock.namn}</td>
					<td>{stock.ticker}</td>
					<td>{stock.kurs}</td>
					<td>{stock.senaste}</td>
					<td>{stock.utfall}</td>
					{stock.larm == 1 ? <td><center><Label bsStyle="danger">Larm</Label></center></td> : stock.flyger == 1 ? <td><center><Label bsStyle="info">Flyger</Label></center></td> : <td></td>}
					<td><center><Button bsSize="xsmall" bsStyle="link" onClick={self.deleteStock.bind(self, stock.id)}>Radera</Button></center></td>
					</tr>
				);				
			}
						
		});

		if (items.length == 0) {
			if (this.state.error)
				var items = <tr><td colSpan="7"><center>{'Kan inte nå servern: ' + self.state.error.message}</center></td></tr>			
			else
				var items = <tr><td colSpan="7"><center>{'Inga aktier'}</center></td></tr>
		}
		
		return(
			<Table striped={true} bordered={true} condensed={true} responsive={true}>
			
		    <thead>
		      <tr>
		        <th>Namn</th>
		        <th>Ticker</th>
		        <th>Köpkurs</th>
		        <th>Senaste</th>
		        <th>%</th>
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
