import React from "react";
import Request from "rest-request";

import {Form, Button, Container, Row, Col, Dropdown, Alert, Card} from 'react-bootify';

require("./new-stock.less");

const ReactDOM = require("react-dom");

const _portfolioSize = 4890000;
const _risc = 0.5;

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
        _stockQuote = props.location.query.senaste; // Om vi editerar sparad aktie kommer senaste kurs här.

//        this.url = "http://app-o.se:3000";
//        this.api = new Request(this.url);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        
        this.state = {focus:'stockticker', helpATR: "", helpReport: "", helpPercentage: "", title: "Ange källa", selectedOption: "option1", sourceID: null, sources: [], inputs:{}};
    }

	componentDidMount() {
        var self = this;
        var stoplossOption = "option1";
        var helpATR = "";
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
							self.state.inputs.stockticker = body[0].ticker;  		
							self.state.inputs.stockname   = body[0].namn;  		                    
							self.state.inputs.stockprice  = body[0].kurs;
							self.state.inputs.stockcount  = body[0].antal;		
		
		                    if (body[0].stoplossTyp == 1) {
								self.state.inputs.atrmultiple = body[0].ATRMultipel;
		                        stoplossOption = "option1";
		                    } else if (body[0].stoplossTyp == 2) {
								self.state.inputs.stoplossquote = body[0].stoplossKurs;
		                        stoplossOption = "option2";
		                    } else {
								self.state.inputs.stoplosspercentage = body[0].stoplossProcent * 100;
		                        stoplossOption = "option3";
		                    }
				
		                    helpATR = ((body[0].ATR / _stockQuote) * 100).toFixed(2) + "% (" + body[0].ATR.toFixed(2) + ")";
							sourceText = sources.find(source => source.id === body[0].källa).text;
		                    self.setState({helpATR: helpATR, selectedOption: stoplossOption, sourceID: body[0].källa, title: sourceText});
		                } 
		                else
		                	console.log(err);
	            	});
		        } else {
		            self.setState({helptext: helpATR, selectedOption: stoplossOption});
		        }
		
            } 
            else
            	console.log(err);
	   	});
	   	
    }
    
    unvalidInput() {
	    
/*        if (this.state.selectedOption == "option1") {
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
*/
        if (this.state.selectedOption == "option1") {
            if (!(this.state.inputs.atrmultiple != undefined && isNumeric(this.state.inputs.atrmultiple))) {
                return true;
            }
        } else if (this.state.selectedOption == "option2") {
            if (!(this.state.inputs.stoplossquote != undefined && isNumeric(this.state.inputs.stoplossquote))) {
                return true;
            }
        } else if (this.state.selectedOption == "option3") { 
        	if (!(this.state.inputs.stoplosspercentage != undefined && isNumeric(this.state.inputs.stoplosspercentage))) {
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
        	ReactDOM.findDOMNode(this.refs.atrmultiple).focus();
        else if (changeEvent.target.value == "option2")
        	ReactDOM.findDOMNode(this.refs.stoplossquote).focus();
        else
        	ReactDOM.findDOMNode(this.refs.stoplosspercentage).focus();
    }
    
	onTextChange(event) {
        var inputs = this.state.inputs;

        // Säkerställ decimaltal '.' på pris, atr-multipel och stoploss
        if (event.target.id == 'stockprice' || event.target.id == 'atrmultiple' || event.target.id == 'stoplossquote' || event.target.id == 'stoplosspercentage') {
	        if (isNaN(event.target.value))
	        	event.target.value = event.target.value.slice(0, event.target.value.length-1);
        }

		// Säkerställ heltal på antal
        if (event.target.id == 'stockcount') {
	        if (isNaN(event.target.value) || event.target.value.slice(event.target.value.length-1, event.target.value.length) == '.')
	        	event.target.value = event.target.value.slice(0, event.target.value.length-1);
        }
        
        if (event.target.id == 'stoplossquote') {	        
	        if (!Number.isNaN(_stockQuote) && !Number.isNaN(event.target.value) && event.target.value != "") {
	            this.setState({helpPercentage: ((1 - (_stockQuote/event.target.value))*100).toFixed(2)+"%"});		        
	        }
	        else
	            this.setState({helpPercentage: "n/a"});
        }

        if (event.target.id == 'atrmultiple') {	        
	        if (!Number.isNaN(_stockQuote) && !Number.isNaN(event.target.value) && event.target.value != "" && !Number.isNaN(_ATR)) {
	            this.setState({helpPercentage: ((1 - (_stockQuote/(_stockQuote-event.target.value*_ATR)))*100).toFixed(2)+"%"});		        
	        }
	        else
	            this.setState({helpPercentage: "n/a"});
        }
                
        inputs[event.target.id] = event.target.value;
        this.setState({inputs:inputs});
    }

    handleKeyPress(target) {
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
                    "content-type": "application/json"
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
                                "content-type": "application/json"
                            }
                        };

                        var req = request(options, function(err, response, body) {
                            if (!err) {
                                var helpATR;
                                var helpReport;

                                _ATR = body.ATR;
								_stockQuote = body.quote;                                
                                
                                helpATR = Math.round(body.atrPercentage * 100 * 100) / 100 + "% (" + _ATR + ")";
                                helpReport = getSweDate(body.earningsDate[0]);

                                self.setState({helpATR: helpATR, helpReport: helpReport, focus:'stockprice'});
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
                                <Form.Input autoFocus={this.state.focus=='stockticker'} disabled={_stockID != undefined} value={this.state.inputs.stockticker} padding={{bottom:1}} type="text" id="stockticker" placeholder="Kortnamn för aktien" onChange={this.onTextChange.bind(this)} onKeyPress={this.handleKeyPress.bind(this)}/>
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
                            <Form.Col sm={2} textAlign='right' >
                                <Form.Label inline textColor='muted'>
                                    Stop loss
                                </Form.Label>
                            </Form.Col>

                            <Form.Col sm={11}>
                                <Form inline  padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option1" checked={this.state.selectedOption === "option1"} onChange={this.handleOptionChange}>
                                        Släpande
                                    </Form.Radio>

                                    <Form.Input value={this.state.inputs.atrmultiple} margin={{left:2, right:2}} type="text" ref="atrmultiple" id="atrmultiple" placeholder="x ATR?" onChange={this.onTextChange.bind(this)}/>

	                                <Alert color='warning' ref="infobox" id="infobox">
										<small>ATR: {this.state.helpATR}<br/>
										Rapport: {this.state.helpReport}<br/>
										Procent: {this.state.helpPercentage}</small>
									</Alert>

                                </Form>

                                <Form inline padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option2" checked={this.state.selectedOption === "option2"} onChange={this.handleOptionChange}>
                                        Under kurs
                                    </Form.Radio>

                                    <Form.Input value={this.state.inputs.stoplossquote} margin={{bottom:0, left:2, right:2}} type="text" ref="stoplossquote" id="stoplossquote" placeholder="Kurs?" onChange={this.onTextChange.bind(this)}/>
                                </Form>
                                
                                <Form inline padding={{bottom:1, top:1}}>
                                    <Form.Radio value="option3" checked={this.state.selectedOption === "option3"} onChange={this.handleOptionChange}>
                                        Släpande under procent
                                    </Form.Radio>
                                    <Form.Input  value={this.state.inputs.stoplosspercentage} margin={{left:2, right:2}} type="text" ref="stoplosspercentage" id="stoplosspercentage" placeholder="%" onChange={this.onTextChange.bind(this)}/>
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

                    <Form.Group>
                        <Form.Row>
                            <Form.Group xs={12} sm={12} md={6}>
                                <Card>
							        <Card.Header>
										Stop Loss
							        </Card.Header>                                
                                    <Card.Body>
	                                    <Form.Radio value="option1" checked={this.state.selectedOption === "option1"} onChange={this.handleOptionChange}>
	                                        Släpande
	                                    </Form.Radio>
	
	                                    <Form.Input value={this.state.inputs.atrmultiple} margin={{left:2, right:2}} type="text" ref="atrmultiple" id="atrmultiple" placeholder="x ATR?" onChange={this.onTextChange.bind(this)}/>

	                                    <Form.Radio value="option2" checked={this.state.selectedOption === "option2"} onChange={this.handleOptionChange}>
	                                        Under kurs
	                                    </Form.Radio>
	
	                                    <Form.Input value={this.state.inputs.stoplossquote} margin={{bottom:0, left:2, right:2}} type="text" ref="stoplossquote" id="stoplossquote" placeholder="Kurs?" onChange={this.onTextChange.bind(this)}/>
                                
	                                    <Form.Radio value="option3" checked={this.state.selectedOption === "option3"} onChange={this.handleOptionChange}>
	                                        Släpande under procent
	                                    </Form.Radio>
	                                    <Form.Input  value={this.state.inputs.stoplosspercentage} margin={{left:2, right:2}} type="text" ref="stoplosspercentage" id="stoplosspercentage" placeholder="%" onChange={this.onTextChange.bind(this)}/>
                                    </Card.Body>
                                </Card>
                            </Form.Group>
                            <Form.Group xs={12} sm={12} md={6}>
                                <Card>
                                    <Card.Body>
										<small>ATR: {this.state.helpATR}<br/>
										Rapport: {this.state.helpReport}<br/>
										Procent: {this.state.helpPercentage}</small>                                    
                                    </Card.Body>
                                </Card>
                            </Form.Group>
                        </Form.Row>
                    </Form.Group>
                        
                                                
                    </Form>
                </Container>
            </div>
        );
    }
};

