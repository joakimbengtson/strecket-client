import React from "react";
import {Popover, Button, Container, Table, Row, Col} from 'react-bootify';
import {isArray} from 'yow/is';
import PropTypes from 'prop-types';
import Request from "yow/request";

require("./looker.less");

module.exports = class Home extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = {stocks:[], busy:false};
    }

    fetch(symbol) {
        return new Promise((resolve, reject) => {
            var request = new Request("http://app-o.se:3000");

            request
                .get("/rawdump/" + symbol)
                .then(response => {
                    resolve(response.body);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
        
    
    componentDidMount() {
        var self = this;
        var request = new Request('http://app-o.se:3012');
        var query = {};
        const increaseLimit = 0.20;
        
        query.sql = 'select symbol from stocks';

        request.get('/mysql', {query:query}).then(response => {
	            
            var stocks = response.body;
            
            for (var i in stocks) {
                            
		        self.fetch(stocks[i].symbol)
		            .then(rawDump => {
						if (rawDump.earnings !== undefined) {		
							if (rawDump.earnings.financialsChart.quarterly !== undefined) {
								var incr1, incr2, incr3;
								
								console.log("---Ticker:", rawDump.price.symbol);
								console.log("earnings=", rawDump.earnings.financialsChart.quarterly[0].earnings, rawDump.earnings.financialsChart.quarterly[1].earnings, rawDump.earnings.financialsChart.quarterly[2].earnings, rawDump.earnings.financialsChart.quarterly[3].earnings);			
								
								incr1 = (rawDump.earnings.financialsChart.quarterly[1].earnings / rawDump.earnings.financialsChart.quarterly[0].earnings) - 1;
								incr2 = (rawDump.earnings.financialsChart.quarterly[2].earnings / rawDump.earnings.financialsChart.quarterly[1].earnings) - 1;
								incr3 = (rawDump.earnings.financialsChart.quarterly[3].earnings / rawDump.earnings.financialsChart.quarterly[2].earnings) - 1;						
								
								console.log("increase=", incr1.toFixed(2), incr2.toFixed(2), incr3.toFixed(2));
								
								if (incr1 > increaseLimit && incr2 > increaseLimit && incr3 > increaseLimit) {
									var candidate = {ticker:rawDump.price.symbol, incr1:incr1, incr2:incr2, incr3:incr3};
									
									self.setState({stocks: this.state.stocks.concat(candidate)});
									
								}
							}			
						}
							            
		            })
		            .catch(error => {
			            console.log("Fel", error);
		                this.setState({ready: true});
		            });
		    }
        })
        .catch(error => {
            console.error(error.message);
        });
				
    }
        
    onCancel() {
        window.history.back();
    }
    
    
    renderStocks() {
        var self = this;

        var items = this.state.stocks.map(function(stock, index) {
            return (
                <tr key={index}>
                    <td>
                    	{stock.ticker}
                    </td>
                    <td style={{textAlign: "right"}}>
                        {(stock.incr1*100).toFixed(2)+'%'}
                    </td>
                    <td style={{textAlign: "right"}}>
                        {(stock.incr2*100).toFixed(2)+'%'}
                    </td>
                    <td style={{textAlign: "right"}}>
                        {(stock.incr3*100).toFixed(2)+'%'}
                    </td>                    
                </tr>
            );
        }); 

        if (items.length == 0) {
            if (this.state.error)
                var items = (
                    <tr>
                        <td colSpan="4">
                            <center>{"Kan inte nå servern: " + self.state.error.message}</center>
                        </td>
                    </tr>
                );
            else
                var items = (
                    <tr>
                        <td colSpan="4">
                            <center>{"Inga aktier"}</center>
                        </td>
                    </tr>
                );
        }

        return (
            <div>
                <Table striped={true} bordered={true} responsive={true}>
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th style={{textAlign: "right"}}>Ökning q1</th>
                            <th style={{textAlign: "right"}}>Ökning q2</th>
                            <th style={{textAlign: "right"}}>Ökning q3</th>
                        </tr>
                    </thead>

                    <tbody>{items}</tbody>
                </Table>

            </div>
        );
    }
    

    render() {
        return (
            <div id="looker">
                <Container>
                    <Container.Row>
                        <br/>
                    </Container.Row>
                    <Container.Row>
                        <Container.Col>
                            {this.renderStocks()}
                        </Container.Col>
                    </Container.Row>

                    <Container.Row>
                        <Button margin={{left:1, right:1}} color="success" size="lg" onClick={this.onCancel.bind(this)}>
                            Stäng
                        </Button>
                    </Container.Row>
                </Container>
            </div>
        );
    }
};

