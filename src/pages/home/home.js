import React from "react";
require("./home.less");
import {Button, Container, Table, Row, Col} from 'react-bootify';
import {isArray} from 'yow/is';

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

    deleteStock(id) {
        var self = this;

        console.log("Raderar aktie " + id);

        var request = require("client-request");

        var options = {
            uri: "http://app-o.se:3000/stocks/" + id,
            method: "DELETE",
            timeout: 3000,
            json: true,
            headers: {
                "content-type": "application/json" // setting headers is up to *you*
            }
        };

        var req = request(options, function(err, response, body) {
            if (!err) {
                self.fetchStocks();
            } else console.log(err);
        });
    }

    fetchStocks() {
        var self = this;

        console.log("Hämtar aktiekurser...");

        var request = require("client-request");

        var options = {
            uri: "http://app-o.se:3000/stocks",
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
            }
        };

        var req = request(options, function(err, response, body) {
            if (!err) {

                // MEG:s påhitt. Om inget finns i listan, lägg till en påhittad.
                if (isArray(body) && body.length == 0) {
                    var stock = {};
                    stock.namn = 'Genererats när inga aktier fanns';
                    stock.ticker = 'AAPL';
                    stock.senaste = 3.4;
                    stock.kurs = 100;
                    stock.sector = 'Olle';
                    stock.sma200 = 23;
                    stock.sma50 = 23;
                    stock.utfall = 4;
                    stock.stoplossProcent = 4;
                    stock.stoplossKurs = 4;
                    stock.antal = 10;
                    stock.earningsDate = [1, 2, 3];
    
    
                    body.push(stock);
                }  

                self.setState({stocks: body});
            } else {
                self.setState({error: err});
                console.log(err);
            }
        });
    }

    getColor(percentage) {
        const green5 = {backgroundColor: "#00610e"};
        const green4 = {backgroundColor: "#3d860b"};
        const green3 = {backgroundColor: "#34a203"};
        const green2 = {backgroundColor: "#6ec007"};
        const green1 = {backgroundColor: "#c1d11f"};
        const red1 = {backgroundColor: "#ffb5b5"};
        const red2 = {backgroundColor: "#ff9393"};
        const red3 = {backgroundColor: "#ff6a6a"};
        const red4 = {backgroundColor: "#ff3e3e"};
        const red5 = {backgroundColor: "#ff2d2d"};

        var p = parseFloat(percentage);

        if (p > 20) return green5;

        if (p > 15) return green4;

        if (p > 10) return green3;

        if (p > 5) return green2;

        if (p > 0) return green1;

        if (p > -5) return red1;

        if (p > -10) return red2;

        if (p > -15) return red3;

        if (p > -20) return red4;
        else return red5;
    }

    renderStocks() {
        var self = this;

        var items = this.state.stocks.map(function(stock, index) {
            if (stock.antal > 0) {
                return (
                    <tr key={index}>
                        <td>{stock.ticker}</td>
                        <td style={{textAlign: "right"}}>
                            {parseFloat(stock.senaste).toFixed(2)}
                            <span style={{color: "#b2b2b2"}}> ({parseFloat(stock.kurs).toFixed(2)})</span>
                        </td>
                        <td style={{textAlign: "right"}}>
                            {parseFloat(stock.utfall).toFixed(2)}
                            <span style={{color: "#b2b2b2"}}> ({parseFloat((1 - stock.kurs / stock.maxkurs) * 100).toFixed(2)})</span>
                        </td>
                        {stock.sma50 != -1 ? (
                            <td style={self.getColor(parseFloat((1 - stock.sma50 / stock.senaste) * 100).toFixed(2))}>{}</td>
                        ) : (
                            <td style={{backgroundColor: "#f2f2a4"}}>{}</td>
                        )}
                        {stock.sma200 != -1 ? (
                            <td style={self.getColor(parseFloat((1 - stock.sma200 / stock.senaste) * 100).toFixed(2))}>{}</td>
                        ) : (
                            <td style={{backgroundColor: "#f2f2a4"}}>{}</td>
                        )}
                        {stock.stoplossTyp == 3 ? (
                            <td style={{textAlign: "right"}}>{(stock.stoplossProcent * 100).toFixed(2)}%</td>
                        ) : stock.stoplossTyp == 2 ? (
                            <td style={{textAlign: "right"}}>&gt; {stock.stoplossKurs}</td>
                        ) : (
                            <td style={{textAlign: "right"}}>
                                {(stock.atrStoploss * 100).toFixed(2)}%<sup>*</sup>
                            </td>
                        )}
                        {stock.larm == 1 ? (
                            <td>
                                <center>
                                    <span className='label label-danger'>Larm</span>
                                </center>
                            </td>
                        ) : stock.flyger == 1 ? (
                            <td>
                                <center>
                                    <span className='label label-info'>Larm</span>
                                </center>
                            </td>
                        ) : (
                            <td />
                        )}
                        <td>
                            <center>
                                <Button size="xs" bsStyle="link" onClick={self.deleteStock.bind(self, stock.id)}>
                                    Logout
                                </Button>
                            </center>
                        </td>
                        <td>
                            <center>
                                <Button size="xs" bsStyle="link" href={"#new-stock/?id=" + stock.id + "&senaste=" + stock.senaste}>
                                    Edit
                                </Button>
                            </center>
                        </td>
                        {stock.utfall > 0 && dayDiff(stock.köpt_datum) > 0 ? (
                            <td style={{textAlign: "right"}}>
                                <span style={{color: "#b2b2b2"}}>
                                    <small>
                                        {((stock.utfall / dayDiff(stock.köpt_datum)) * 365).toFixed(0)}
                                        %, {dayDiff(stock.köpt_datum)}
                                        d, ({stock.utdelning != null ? Number(stock.utdelning).toFixed(2) : "n/a"})
                                    </small>
                                </span>
                            </td>
                        ) : (
                            <td style={{textAlign: "right"}}>
                                <span style={{color: "#b2b2b2"}}>
                                    <small>-, {dayDiff(stock.köpt_datum)}d</small>
                                </span>
                            </td>
                        )}
                        <td>{getSweDate(stock.earningsDate[0])}</td>
                    </tr>
                );
            }
        });

        var rates = this.state.stocks.map(function(stock, index) {
            if (stock.antal == -1) {
                return (
                    <tr key={index}>
                        <td>{stock.namn}</td>
                        <td style={{textAlign: "right"}}>{parseFloat(stock.senaste).toFixed(2)}</td>
                        <td style={self.getColor(15)}>{}</td>
                        <td style={self.getColor(parseFloat((1 - stock.sma50 / stock.senaste) * 100).toFixed(2))}>{}</td>
                        <td style={self.getColor(parseFloat((1 - stock.sma200 / stock.senaste) * 100).toFixed(2))}>{}</td>
                    </tr>
                );
            }
        });

        if (items.length == 0) {
            if (this.state.error)
                var items = (
                    <tr>
                        <td colSpan="10">
                            <center>{"Kan inte nå servern: " + self.state.error.message}</center>
                        </td>
                    </tr>
                );
            else
                var items = (
                    <tr>
                        <td colSpan="10">
                            <center>{"Inga aktier"}</center>
                        </td>
                    </tr>
                );
        }

        return (
            <div>
                <Table striped={true} bordered={true} condensed={true} responsive={true}>
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th style={{textAlign: "right"}}>Kurs</th>
                            <th style={{textAlign: "center"}}>%</th>
                            <th style={{textAlign: "center"}}>ma50 </th>
                            <th style={{textAlign: "center"}}>ma200</th>
                            <th style={{textAlign: "right"}}>S/L</th>
                            <th />
                            <th />
                            <th />
                            <th style={{textAlign: "right"}}>yY</th>
                            <th>Rapport</th>
                        </tr>
                    </thead>

                    <tbody>{items}</tbody>
                </Table>

                <br />

                <Table striped={true} bordered={true} responsive={true}>
                    <thead>
                        <tr>
                            <th>Valuta</th>
                            <th style={{textAlign: "right"}}>Kurs</th>
                            <th style={{textAlign: "center"}}>ema8</th>
                            <th style={{textAlign: "center"}}>ma50 </th>
                            <th style={{textAlign: "center"}}>ma200</th>
                        </tr>
                    </thead>

                    <tbody>{rates}</tbody>
                </Table>
            </div>
        );
    }

    render() {
        return (
            <div id="home">
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
                        <Button color="success" size="lg" href="#new-stock">
                            Nytt köp
                        </Button>
                        <span>{' '}</span>
                        <Button color="info" size="lg" href="#meg">
                            Kandidater
                        </Button>
                    </Container.Row>
                </Container>
            </div>
        );
    }
};

