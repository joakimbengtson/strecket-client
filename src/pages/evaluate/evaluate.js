import React from "react";
import {Popover, Button, Container, Table, Row, Col} from 'react-bootify';
import {isArray} from 'yow/is';
import {Sparklines, SparklinesLine, SparklinesReferenceLine, SparklinesBars} from 'react-sparklines';
import {BarChart, Bar, Tooltip} from 'recharts';
import PropTypes from 'prop-types';


require("./evaluate.less");

function dayDiff(d) {
    var dt1 = new Date(d);
    var dt2 = new Date();

    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}

function pad(n) {
    return n < 10 ? "0" + n : n;
}

function getSweDate(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();

    if (UNIX_timestamp == null) return "n/a";

    var time = year.toString().substr(-2) + pad(month) + pad(date);

    return time;
}

module.exports = class Home extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = {stocks: [], error: ""};
    }

    componentDidMount() {
        this.fetchStocks();
    }

    fetchStocks() {
        var self = this;

        console.log("Hämtar sålda aktier...");

        var request = require("client-request");

        var options = {
            uri: "http://app-o.se:3000/sold_stocks",
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
            }
        };

        var req = request(options, function(err, response, body) {
            if (!err) {
                self.setState({stocks: body});
            } else {
                self.setState({error: err});
                console.log(err);
            }
        });
    }
    
    onCancel() {
        window.history.back();
    }    

    renderStocks() {
        var self = this;
        var sum = 0;

        var items = this.state.stocks.map(function(stock, index) {
            if (stock.antal > 0) {
	            sum = sum + (1 - stock.kurs / stock.såld_kurs);
                return (
                    <tr key={index}>
                        <td>
	                        <span >{stock.ticker}</span>
                        </td>
                        <td style={{textAlign: "right"}}>
                            <span>{parseFloat((1 - stock.kurs / stock.såld_kurs) * 100).toFixed(2)}%</span>
                        </td>
                        <td style={{textAlign: "right"}}>
                            <span>{parseFloat(stock.utfall).toFixed(2)}%</span>
                        </td>
                        <td>
                            <span>{stock.text}</span>
                        </td>                        
                        <td>
                            <span>{(stock.såld_datum).substring(0, 10)}</span>
                        </td>                        
                    </tr>
                );
            }
        }); 
        
        if (items.length == 0) {
            if (this.state.error)
                var items = (
                    <tr>
                        <td colSpan="5">
                            <center>{"Kan inte nå server: " + self.state.error.message}</center>
                        </td>
                    </tr>
                );
            else
                var items = (
                    <tr>
                        <td colSpan="5">
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
                            <th style={{textAlign: "right"}}>Utfall</th>
                            <th style={{textAlign: "right"}}>Utfall nu</th>
                            <th>Källa</th>
                            <th>Såld</th>
                        </tr>
                    </thead>

                    <tbody>{items}
                    <tr><td colSpan="5">{(sum).toFixed(2)}%</td></tr>
                    </tbody>
                </Table>

                <br />

            </div>
        );
    }

    render() {
        return (
            <div id="evaluate">
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

