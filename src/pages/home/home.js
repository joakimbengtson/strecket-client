import React from 'react';
import {Jumbotron, Button, Grid, Row, Col} from 'react-bootstrap';

require('./home.less');


module.exports = class Home extends React.Component {


	constructor(props) {
		super(props);
		this.state = {};
	};


	render() {
		var style = {};

		return (
			<div id="home">
				<Grid>
					<Row>
						<br/>
					</Row>
					<Row>
						<Col sm={10} smOffset={1} md={8} mdOffset={2}>
							<Jumbotron>
						      <h1>Hello, world!</h1>
						      <p>This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
						      <p><Button bsStyle="primary">Learn more</Button></p>
						    </Jumbotron>
						</Col>
					</Row>
				</Grid>
			</div>

		);
	};
};
