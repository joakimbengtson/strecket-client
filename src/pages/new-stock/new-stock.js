import React from "react";
import Request from "rest-request";

import {Form, Button, Container, Row, Col, Dropdown} from 'react-bootify';

require("./new-stock.less");

const ReactDOM = require("react-dom");

var _ATR;
var _stockID;
var _stockQuote;
var _stoplossType = {
    StoplossTypeATR: 1,
    StoplossTypeQuote: 2,
    StoplossTypePercent: 3
};

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

        this.url = "http://app-o.se:3000";
        this.api = new Request(this.url);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        
        this.state = {focus:'stockticker', helptext: "", title: "Ange källa", selectedOption: "option1", sourceID: null, sources: [], inputs:{}};
    }

	componentDidMount() {
        var self = this;
        var stoplossOption = "option1";
        var helpStr = "";
        var sourceText;
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

		    	for (i = 0; i < body.length; i++) {
			    	sources.push(body[i]);
				}
				self.setState({sources: sources});

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
				
		                    helpStr = "(ATR = " + body[0].ATR.toFixed(2) + " ATR % = " + ((body[0].ATR / _stockQuote) * 100).toFixed(2) + "%)";
							sourceText = sources.find(source => source.id === body[0].källa).text;
		                    self.setState({helptext: helpStr, selectedOption: stoplossOption, sourceID: body[0].källa, title: sourceText});
		                } 
		                else
		                	console.log(err);
	            	});
		        } else {
		            self.setState({helptext: helpStr, selectedOption: stoplossOption});
		        }
		
            } 
            else
            	console.log(err);
	   	});
	   	
    }
    
    unvalidInput() {
	    
        if (this.state.selectedOption == "option1") {
            if (!(this.state.inputs.atrmultiple != undefined && this.state.inputs.atrmultiple.length > 0 && isNumeric(this.state.inputs.atrmultiple))) {
                return true;
            }
        } else if (this.state.selectedOption == "option2") {
            if (!(this.state.inputs.stoplossquote != undefined && this.state.inputs.stoplossquote.length > 0 && isNumeric(this.state.inputs.stoplossquote))) {
                return true;
            }
        } else if (this.state.selectedOption == "option3") { 
        	if (!(this.state.inputs.stoplosspercentage != undefined && this.state.inputs.stoplosspercentage.length > 0 && isNumeric(this.state.inputs.stoplosspercentage))) {
                return true;
            }
        }	    
	
		if (this.state.inputs.stockticker != undefined && this.state.inputs.stockticker.length == 0)
			return true;

		if (this.state.inputs.stockname != undefined && this.state.inputs.stockname.length == 0)
			return true;

		if (this.state.inputs.stockprice != undefined && this.state.inputs.stockprice.length == 0)
			return true;

		if (this.state.inputs.stockcount != undefined && this.state.inputs.stockcount.length == 0)
			return true;
	    
		// Dropdown vald
	    if (!isNumeric(this.state.sourceID))
	    	return true;
        	
        return false;
    }

    onSave() {
        var rec = {};
        var today = new Date();

        // ---- SAVE

        var request = require("client-request");

        rec.ticker = this.state.inputs.stockticker.toUpperCase();
        rec.namn = this.state.inputs.stockname;
        rec.kurs = this.state.inputs.stockprice;
        rec.antal = this.state.inputs.stockcount;
        rec.källa = this.state.sourceID;

        if (this.state.selectedOption == "option1") {
            rec.stoplossTyp = _stoplossType.StoplossTypeATR;
            rec.ATRMultipel = this.state.inputs.atrmultiple;
        } else if (this.state.selectedOption == "option2") {
            rec.stoplossTyp = _stoplossType.StoplossTypeQuote;
            rec.stoplossKurs = this.state.inputs.stoplossquote;
        } else {
            rec.stoplossTyp = _stoplossType.StoplossTypePercent;
            rec.stoplossProcent = (this.state.inputs.stoplosspercentage / 100).toFixed(2);
        }

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
    
    handleOptionChange(changeEvent) {
        this.setState({selectedOption: changeEvent.target.value});
        
        if (changeEvent.target.value == "option1")
        	changeEvent.target.focus();
        else if (changeEvent.target.value == "option2")
        	ReactDOM.findDOMNode(this.refs.stoplossQuote).focus();
        else
        	ReactDOM.findDOMNode(this.refs.stoplossPercentage).focus();
        
    }
    
	onTextChange(event) {
        var inputs = this.state.inputs;
        
        inputs[event.target.id] = event.target.value;
        this.setState({inputs:inputs});
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
						var inputs = self.state.inputs;
        
						inputs.stockname = body;
						self.setState({inputs:inputs});

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

                                self.setState({helptext: helpStr, focus:'stockprice'});
                            }
                        });
                    }
                }
            });
        }
    }
    
    setID(source) {
	    this.setState({title:source.text, sourceID:source.id});
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
                                <Form.Input autoFocus={this.state.focus=='stockticker'} value={this.state.inputs.stockticker} padding={{bottom:1}} type="text" id="stockticker" placeholder="Kortnamn för aktien" onChange={this.onTextChange.bind(this)} onKeyPress={this.handleKeyPress.bind(this)}/>
                            </Form.Col>
                        </Form.Group>
                        
                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Namn</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input value={this.state.inputs.stockname} padding={{bottom:1}} type="text" id="stockname" placeholder="Namnet på aktien" onChange={this.onTextChange.bind(this)}/>
                            </Form.Col>
                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Kurs</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input autoFocus={this.state.focus=='stockprice'} value={this.state.inputs.stockprice} padding={{bottom:1}} type="text" id="stockprice" placeholder="Köpt till kursen?"  onChange={this.onTextChange.bind(this)}/>
                            </Form.Col>
                        </Form.Group>

                        <Form.Group row>
                            <Form.Col sm={1} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    <small>Antal</small>
                                </Form.Label>
                            </Form.Col>
                            <Form.Col sm={11}>
                                <Form.Input value={this.state.inputs.stockcount} padding={{bottom:1}} type="text" id="stockcount" placeholder="Antal aktier"  onChange={this.onTextChange.bind(this)}/>
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

                                    <Form.Input value={this.state.inputs.atrmultiple} margin={{left:2, right:2}} type="text" id="atrmultiple" placeholder="x ATR?" onChange={this.onTextChange.bind(this)}/>

                                    <span ref="stoplosshelper">
                                        <span style={{color: "#b2b2b2"}}>{this.state.helptext}</span>
                                    </span>

                                </Form>

                                <Form inline  padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option2" checked={this.state.selectedOption === "option2"} onChange={this.handleOptionChange}>
                                        Under kurs
                                    </Form.Radio>

                                    <Form.Input value={this.state.inputs.stoplossquote} margin={{bottom:0, left:2, right:2}} type="text" id="stoplossquote" placeholder="Kurs?" onChange={this.onTextChange.bind(this)}/>
                                </Form>
                                
                                <Form inline padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option3" checked={this.state.selectedOption === "option3"} onChange={this.handleOptionChange}>
                                        Släpande under procent
                                    </Form.Radio>
                                    <Form.Input  value={this.state.inputs.stoplosspercentage} margin={{left:2, right:2}} type="text" id="stoplosspercentage" placeholder="%" onChange={this.onTextChange.bind(this)}/>
                                </Form>
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
                                <Button color="success" onClick={this.onSave.bind(this)} disabled={this.unvalidInput()}>
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

