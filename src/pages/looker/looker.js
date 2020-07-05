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

            var request = new Request("http://85.24.185.150:3000");

            request
                .get("/rawdump/" + symbol)
                .then(response => {
                    resolve(response.body);
                })
                .catch(error => {
	                console.log("FEL: fetch:", error);
                    reject(error);
                });
        });
    }
    
    
    componentDidMount() {
        var self = this;
        var request = new Request('http://85.24.185.150:3000');
        var query = {};
        var stocks;
        const increaseLimit = 0.20;
        
        query.sql = 'select symbol from stocks';

        request.get('/mysql', {query:query}).then(response => {
	            
            stocks = response.body;
            
            var loop = (index) => {
                if (index < stocks.length) {
                    self.fetch(stocks[index].symbol).then(rawDump => {

						if (typeof rawDump !== 'undefined' && rawDump != '[]') {		
							if (typeof rawDump.earnings !== 'undefined' && rawDump.earnings != '[]') {		
								if (typeof rawDump.earnings.financialsChart.quarterly !== 'undefined' && rawDump.earnings.financialsChart.quarterly.length) {
									var incr1, incr2, incr3;
									
									console.log("---Ticker:", rawDump.price.symbol);
									console.log("earnings=", rawDump.earnings.financialsChart.quarterly[0].earnings, rawDump.earnings.financialsChart.quarterly[1].earnings, rawDump.earnings.financialsChart.quarterly[2].earnings, rawDump.earnings.financialsChart.quarterly[3].earnings);			
									var q = rawDump.earnings.financialsChart.quarterly;
									
									if (q[0].earnings > 0 && q[1].earnings > 0 && q[2].earnings > 0 && q[3].earnings > 0) {
										incr1 = (q[1].earnings / q[0].earnings) - 1;
										incr2 = (q[2].earnings / q[1].earnings) - 1;
										incr3 = (q[3].earnings / q[2].earnings) - 1;						
										
										console.log("increase=", incr1.toFixed(2), incr2.toFixed(2), incr3.toFixed(2));
										
										if (incr1 > increaseLimit && incr2 > increaseLimit && incr3 > increaseLimit) {
											var candidate = {ticker:rawDump.price.symbol, incr1:incr1, incr2:incr2, incr3:incr3};

											self.setState({stocks: this.state.stocks.concat(candidate)});	
										}										
									}
									
								}			
							}
						}
								            			            
                        loop(index + 1);
                    })
                    .catch((error) => {
                        console.log("FEL: från fetch:", error);
                    });
                }
                else {
	                console.log("Done!");
                }    
            };
    
            loop(0);            
            
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

