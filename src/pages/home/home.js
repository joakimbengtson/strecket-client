import React from 'react';
import {Jumbotron, Button, Grid, Row, Col} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader, Table, thead, td, tr, th} from 'react-bootstrap';
import Request from 'rest-request';
require('./home.less');




module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);

		//this.url = 'http://app-o.se:5000';
		this.url = 'http://localhost:3000';
		this.api = new Request(this.url);
		this.state = {stocks:[]};

	};

	// Virtuell function som anropas då sidan visas
	componentDidMount() {
		this.fetchStocks();
	}

	fetchStocks() {
		var self = this;

		console.log('Hämtar aktiekurser...');

		self.api.get('stocks').then(function(stocks) {
			console.log(stocks);
			self.setState({stocks:stocks});
		})
		.catch(function(error) {
			console.log(error);

		});
	}

	renderStocks() {
		var items = this.state.stocks.map(function(stock, index) {
			return (
				<tr key={index}>
				<td>{stock.namn}</td>
				<td>{stock.ticker}</td>
				<td>{stock.antal}</td>
				<td>{stock.kurs}</td>
				</tr>
			);
		});

		if (items.length == 0) {
				<td colSpan="4">{'Inga aktier'}</td>
		}

		return(
			<Table striped={true} bordered={true} condensed={true} responsive={true}>
			
		    <thead>
		      <tr>
		        <th>Namn</th>
		        <th>Ticker</th>
		        <th>Antal</th>
		        <th>Kurs</th>
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
								<Col sm={10} smOffset={1} md={8} mdOffset={2}>
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
