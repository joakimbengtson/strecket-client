import React from 'react';
import {Jumbotron, Button, Grid, Row, Col} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
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
				<ListGroupItem key={index} href='#'>
					{stock.namn + ' ' + stock.antal}
				</ListGroupItem>
			);
		});

		if (items.length == 0) {
			return <div/>;
		}

		return(
			<div>
				<PageHeader>Aktier</PageHeader>

				<ListGroup>
					{items}
				</ListGroup>
			</div>
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
