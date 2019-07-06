import React from "react";
import Request from "rest-request";

import {Form, Button, Container, Row, Col, Dropdown} from 'react-bootify';

require("./new-stock.less");

const ReactDOM = require("react-dom");

var _inputfield;
var _ATR;
var _stockID;
var _stockQuote;
var _stoplossType = {
    StoplossTypeATR: 1,
    StoplossTypeQuote: 2,
    StoplossTypePercent: 3
};
var _percentile10;

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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

        _stockID = props.location.query.id;
        _stockQuote = props.location.query.senaste;
        _percentile10 = false;

        this.url = "http://app-o.se:3000";
        this.api = new Request(this.url);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        
        this.state = {helptext: "", title: "Ange källa", selectedOption: "option1", selectedCheck: false, sourceID: null, sources: []};
    }

    handleCheckChange(changeEvent) {
        _percentile10 = !_percentile10;
        this.setState({selectedCheck: _percentile10});
    }

    handleOptionChange(changeEvent) {
        this.setState({selectedOption: changeEvent.target.value});

        if (changeEvent.target.value == "option1") ReactDOM.findDOMNode(this.refs.ATRMultiple).focus();
        else if (changeEvent.target.value == "option2") ReactDOM.findDOMNode(this.refs.stoplossQuote).focus();
        else ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();
    }

	componentDidMount() {
        var self = this;
        var stoplossOption = "option1";
        var helpStr = "";
        var request = require("client-request");

        var options = {
            uri: "http://app-o.se:3000/sources",
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
            }
        };

        var req = request(options, function(err, response, body) {
	    	if (!err) {
		    	var sources = [];
		    	var i;
console.log(body);
		    	for (i = 0; i < body.length; i++) {
			    	sources.push(body[i]);
				}
				self.setState(sources: sources);

		        // Om vi har ett ID, hämta aktien
		        if (_stockID != undefined) {
		
		            options = {
		                uri: "http://app-o.se:3000/stock/" + _stockID,
		                method: "GET",
		                json: true,
		                headers: {
		                    "content-type": "application/json"
		                }
		            };
		
		            var req = request(options, function(err, response, body) {
		                if (!err) {
		                    ReactDOM.findDOMNode(self.refs.stockticker).value = body[0].ticker;
		                    ReactDOM.findDOMNode(self.refs.stockticker).disabled = true;
		
		                    ReactDOM.findDOMNode(self.refs.stockname).value = body[0].namn;
		                    ReactDOM.findDOMNode(self.refs.stockname).focus();
		
		                    ReactDOM.findDOMNode(self.refs.stockprice).value = body[0].kurs;
		                    ReactDOM.findDOMNode(self.refs.stockcount).value = body[0].antal;
		
		                    if (body[0].stoplossTyp == 1) {
		                        ReactDOM.findDOMNode(self.refs.ATRMultiple).value = body[0].ATRMultipel;
		                        stoplossOption = "option1";
		                    } else if (body[0].stoplossTyp == 2) {
		                        ReactDOM.findDOMNode(self.refs.stoplossQuote).value = body[0].stoplossKurs;
		                        stoplossOption = "option2";
		                    } else {
		                        ReactDOM.findDOMNode(self.refs.stoplossPercentage).value = body[0].stoplossProcent * 100;
		                        stoplossOption = "option3";
		                    }
		
		                    _percentile10 = body[0].percentil10;
		
		                    helpStr = "(ATR = " + body[0].ATR.toFixed(2) + " ATR % = " + ((body[0].ATR / _stockQuote) * 100).toFixed(2) + "%)";
		
		                    self.setState({helptext: helpStr, selectedOption: stoplossOption, selectedCheck: _percentile10});
		                } 
		                else
		                	console.log(err);
	            	});
		        } else {
		            // Sätt fokus på ticker
		            ReactDOM.findDOMNode(self.refs.stockticker).focus();
		            self.setState({helptext: helpStr, selectedOption: stoplossOption, selectedCheck: false});
		        }
		
		        _inputfield = ReactDOM.findDOMNode(self.refs.stockname);
            } 
            else
            	console.log(err);
	   	});
	   	
    }

/* OLD
	componentDidMount() {
        var self = this;
        var stoplossOption = "option1";
        var helpStr = "";

        // Om vi har ett ID, hämta aktien
        if (_stockID != undefined) {
            var request = require("client-request");

            var options = {
                uri: "http://app-o.se:3000/stock/" + _stockID,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json"
                }
            };

            var req = request(options, function(err, response, body) {
                if (!err) {
                    ReactDOM.findDOMNode(self.refs.stockticker).value = body[0].ticker;
                    ReactDOM.findDOMNode(self.refs.stockticker).disabled = true;

                    ReactDOM.findDOMNode(self.refs.stockname).value = body[0].namn;
                    ReactDOM.findDOMNode(self.refs.stockname).focus();

                    ReactDOM.findDOMNode(self.refs.stockprice).value = body[0].kurs;
                    ReactDOM.findDOMNode(self.refs.stockcount).value = body[0].antal;

                    if (body[0].stoplossTyp == 1) {
                        ReactDOM.findDOMNode(self.refs.ATRMultiple).value = body[0].ATRMultipel;
                        stoplossOption = "option1";
                    } else if (body[0].stoplossTyp == 2) {
                        ReactDOM.findDOMNode(self.refs.stoplossQuote).value = body[0].stoplossKurs;
                        stoplossOption = "option2";
                    } else {
                        ReactDOM.findDOMNode(self.refs.stoplossPercentage).value = body[0].stoplossProcent * 100;
                        stoplossOption = "option3";
                    }

                    _percentile10 = body[0].percentil10;

                    helpStr = "(ATR = " + body[0].ATR.toFixed(2) + " ATR % = " + ((body[0].ATR / _stockQuote) * 100).toFixed(2) + "%)";

                    self.setState({helptext: helpStr, selectedOption: stoplossOption, selectedCheck: _percentile10});
                } 
                else
                	console.log(err);
            });
        } else {
            // Sätt fokus på ticker
            ReactDOM.findDOMNode(this.refs.stockticker).focus();
            self.setState({helptext: helpStr, selectedOption: stoplossOption, selectedCheck: false});
        }

        _inputfield = ReactDOM.findDOMNode(this.refs.stockname);
    }
*/

    onSave() {
        var rec = {};
        var today = new Date();

        // ---- VALIDATE

        if (ReactDOM.findDOMNode(this.refs.stockticker).value.length == 0) {
            ReactDOM.findDOMNode(this.refs.stockticker).focus();
            return;
        }

        if (ReactDOM.findDOMNode(this.refs.stockname).value.length == 0) {
            ReactDOM.findDOMNode(this.refs.stockname).focus();
            return;
        }

        if (!(ReactDOM.findDOMNode(this.refs.stockprice).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.stockprice).value))) {
            ReactDOM.findDOMNode(this.refs.stockprice).focus();
            return;
        }

        if (!(ReactDOM.findDOMNode(this.refs.stockcount).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.stockcount).value))) {
            ReactDOM.findDOMNode(this.refs.stockcount).focus();
            return;
        }

        if (this.state.selectedOption == "option1") {
            if (!(ReactDOM.findDOMNode(this.refs.ATRMultiple).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.ATRMultiple).value))) {
                ReactDOM.findDOMNode(this.refs.ATRMultiple).focus();
                return;
            }
        } else if (this.state.selectedOption == "option2") {
            if (!(ReactDOM.findDOMNode(this.refs.stoplossQuote).value.length > 0 && isNumeric(ReactDOM.findDOMNode(this.refs.stoplossQuote).value))) {
                ReactDOM.findDOMNode(this.refs.stoplossQuote).focus();
                return;
            }
        } else {
            if (!ReactDOM.findDOMNode(this.refs.stoplossPercentage).value.length > 0) {
                ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();
                return;
            } else if (isNumeric(ReactDOM.findDOMNode(this.refs.stoplossPercentage).value)) {
                var val = ReactDOM.findDOMNode(this.refs.stoplossPercentage).value;

                if (val > 25) {
                    ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();
                    return;
                }
            } else {
                ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();
                return;
            }
        }

        // ---- SAVE

        var request = require("client-request");

        rec.ticker = ReactDOM.findDOMNode(this.refs.stockticker).value.toUpperCase();
        rec.namn = ReactDOM.findDOMNode(this.refs.stockname).value;
        rec.kurs = ReactDOM.findDOMNode(this.refs.stockprice).value;
        rec.antal = ReactDOM.findDOMNode(this.refs.stockcount).value;

        if (this.state.selectedOption == "option1") {
            rec.stoplossTyp = _stoplossType.StoplossTypeATR;
            rec.ATRMultipel = ReactDOM.findDOMNode(this.refs.ATRMultiple).value;
        } else if (this.state.selectedOption == "option2") {
            rec.stoplossTyp = _stoplossType.StoplossTypeQuote;
            rec.stoplossKurs = ReactDOM.findDOMNode(this.refs.stoplossQuote).value;
        } else {
            rec.stoplossTyp = _stoplossType.StoplossTypePercent;
            rec.stoplossProcent = ReactDOM.findDOMNode(this.refs.stoplossPercentage).value / 100;
        }

        rec.percentil10 = _percentile10;

        rec.ATR = _ATR;

        var options = {
            uri: "http://app-o.se:3000/save",
            method: "POST",
            body: rec,
            timeout: 3000,
            json: true,
            headers: {
                "content-type": "application/json"
            }
        };

        var req = request(options, function callback(err, response, body) {
            if (err) {
                console.log(err);
            }

            window.history.back();
        });
    }

    onCancel() {
        window.history.back();
    }

    handleKeyDown(target) {
        // Tillåt inte ','
        if (target.keyCode == 188) target.preventDefault();
    }

    handleKeyPress(target) {
        // Kolla att tickern finns
        if (target.key == "Enter") {
            var self = this;

            var request = require("client-request");
            var ticker = target.currentTarget.value;

            var options = {
                uri: "http://app-o.se:3000/company/" + ticker,
                method: "GET",
                timeout: 1000,
                json: true,
                headers: {
                    "content-type": "application/json" // setting headers is up to *you*
                }
            };

            var req = request(options, function(err, response, body) {
                if (!err) {
                    if (body != null) {
                        _inputfield.value = body; // Sätt aktienamnet automatiskt

                        options = {
                            uri: "http://app-o.se:3000/atr/" + ticker,
                            method: "GET",
                            timeout: 1000,
                            json: true,
                            headers: {
                                "content-type": "application/json" // setting headers is up to *you*
                            }
                        };

                        var req = request(options, function(err, response, body) {
                            if (!err) {
                                var helpStr;

                                helpStr = "(ATR = " + body.ATR + " ATR % = " + Math.round(body.atrPercentage * 100 * 100) / 100 + "%) " + getSweDate(body.earningsDate[0]);
                                _ATR = body.ATR;

                                self.setState({helptext: helpStr});
                                ReactDOM.findDOMNode(self.refs.stockprice).focus();
                            }
                        });
                    }
                }
            });
        }
    }
    
    setID(source) {
	    this.setState({title:source.name, sourceID:source.id});
    }
    
    renderSources() {
		var self = this;

		var items = this.state.sources.map(function(source) {			
			return (
                <Dropdown.Item key={source.id} onClick={self.setID.bind(self, source)}>
                    {source.text}
                </Dropdown.Item>
            );
        }); 
        
        return items;
    }

    render() {
        return (
            <div id="new_stock">
                <Container>
                    <Form >
                        <Form.Group row>
                            <Form.Col sm={{offset:1}}>
                                <Form.Label tag='h2'>
                                    Ny aktie
                                </Form.Label>
                            </Form.Col>
                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Ticker</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input padding={{bottom:1}} type="text" ref="stockticker" placeholder="Kortnamn för aktien" onKeyPress={this.handleKeyPress}/>
                            </Form.Col>
                        </Form.Group>
                        
                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Namn</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input padding={{bottom:1}} type="text" ref="stockname" placeholder="Namnet på aktien" />
                            </Form.Col>
                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Kurs</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input padding={{bottom:1}} id='price' type="text" ref="stockprice" placeholder="Köpt till kursen?" onKeyDown={this.handleKeyDown} />
                            </Form.Col>
                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Antal</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input padding={{bottom:1}} type="text" ref="stockcount" placeholder="Antal aktier" />
                            </Form.Col>
                        </Form.Group>

                        <Form.Group row>
                        
	                        <Form.Col sm={1} textAlign='right' >
	                            <Form.Label inline textColor='muted'>
	                                <small>
	                                    Källa
	                                </small>
	                            </Form.Label>
	                        </Form.Col>
	                        <Form.Col sm={11}>
	                            <Dropdown placement='bottom-start'>
	                                <Dropdown.Target>
	                                    <Button outline color='secondary'>
	                                        {this.state.title == undefined ? 'Välj källa' : this.state.title}
	                                    </Button>
	                                </Dropdown.Target>
	                                <Dropdown.Menu >
										{this.renderSources()}
	                                </Dropdown.Menu>
	                            </Dropdown>
	                        </Form.Col>                        

                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Stop loss</small>
                                </Form.Label>
                            </Form.Col>

                            <Form.Col sm={11}>
                                <Form inline  padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option1" checked={this.state.selectedOption === "option1"} onChange={this.handleOptionChange}>
                                        Släpande
                                    </Form.Radio>

                                    <Form.Input margin={{left:2, right:2}} type="text" ref="ATRMultiple" placeholder="x ATR?" />

                                    <span ref="stoplosshelper">
                                        <span style={{color: "#b2b2b2"}}>{this.state.helptext}</span>
                                    </span>

                                </Form>

                                <Form inline  padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option2" checked={this.state.selectedOption === "option2"} onChange={this.handleOptionChange}>
                                        Under kurs
                                    </Form.Radio>

                                    <Form.Input margin={{bottom:0, left:2, right:2}} type="text" ref="stoplossQuote" placeholder="Kurs?" />
                                </Form>
                                
                                <Form inline padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option3" checked={this.state.selectedOption === "option3"} onChange={this.handleOptionChange}>
                                        Släpande under procent
                                    </Form.Radio>
                                    <Form.Input  margin={{left:2, right:2}} type="text" ref="stoplossPercentage" placeholder="%" />
                                </Form>
                            </Form.Col>
                        </Form.Group>



                        <Form.Group row>
                            <Form.Col sm={1}>
                                
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Checkbox checked={this.state.selectedCheck} onChange={this.handleCheckChange.bind(this)}>
                                    Öka stop loss med 1% för varje 10%-ökning av kursen
                                </Form.Checkbox>
                            
                            </Form.Col>
    
                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1}>
                                
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Button color='success' outline onClick={this.onCancel.bind(this)}>
                                    Avbryt
                                </Button>
                                <span>{' '}</span>
                                <Button color="success" onClick={this.onSave.bind(this)}>
                                    Spara
                                </Button>
                            
                            </Form.Col>
    
                        </Form.Group>
                    </Form>
                </Container>
            </div>
        );
    }
};

