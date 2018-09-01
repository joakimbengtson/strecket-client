import React from 'react';
import {Jumbotron, Button, Grid, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, HelpBlock, Panel, Radio, Checkbox} from 'react-bootstrap';
import Request from 'rest-request';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

require('./candidates.less');

const ReactDOM = require('react-dom');


var options = {
	
  title: {
    text: 'MEG'
  },
  
  chart: {
    //height: (9 / 16 * 100) + '%',
    height: 200,
    width: 400,
    panning: false
  },  

  rangeSelector: {
    enabled: false
  },  

  navigator: {
    enabled: false
  },  

  tooltip: {
    enabled: false
  },  

  plotOptions: {
    ohlc: {
        color: 'red',
        upColor: 'green',
        lineWidth: 2
     }
  },
  
  xAxis: {
      type: 'datetime',
      
	  dateTimeLabelFormats: {
            second: '%Y-%m-%d<br/>%H:%M:%S',
            minute: '%Y-%m-%d<br/>%H:%M',
            hour: '%Y-%m-%d<br/>%H:%M',
            day: '%Y<br/>%m-%d',
            week: '%Y<br/>%m-%d',
            month: '%Y-%m',
            year: '%Y'
      }      
      
  },

  series: [{
	type: 'ohlc',
	
	data: [
    	[1533114500000, 106.03, 106.45, 105.42, 106.28],
		[1533200900000, 105.4, 108.09, 104.84, 107.57],
		[1533287300000, 107.8, 108.05, 106.82, 108.04]
		]
  }]
  
}

/*
const App = () => <div>
  <HighchartsReact
    highcharts={Highcharts}
    constructorType={'stockChart'}
    options={options}
  />
</div>
*/

					/*
				<div>
				  <HighchartsReact 
				    highcharts={Highcharts}
				    constructorType={'stockChart'}
				    options={options}
				  />
				</div>
				*/		 


module.exports = class Home extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {stocks:['MSFT', 'AAPL']}; 
		
				
		this.url = 'http://app-o.se:3000'; 
		this.api = new Request(this.url);
		
	};
	
	// Virtuell function som anropas då sidan visas
	componentDidMount() {
		var self = this;

	}
		
	
	onCancel() {
		window.history.back();
	}
	
	
	renderGraphs() {
		var self = this;
		 
		var graphs = this.state.stocks.map(function(stock, index) {
					
			return (
				<div>
				  <HighchartsReact
				    highcharts={Highcharts}
				    constructorType={'stockChart'} 
				    {options.title.text = stock}
				    options={options}
				  />
				</div>
			);				
						
		});
				
		return (
			<div>{graphs}</div>
		);
		
	}
		
	render() {
		
		return (
			<div>
			<h1 align="center">HEADER 2018-08-21</h1>
			<br/>
			{this.renderGraphs()}
			</div>
		);
			
	};
};
