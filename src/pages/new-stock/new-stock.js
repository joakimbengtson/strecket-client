import React from "react";
import Request from "rest-request";

import {Form, Button, Container, Row, Col, Dropdown, Alert, Card, Tag} from 'react-bootify';

require("./new-stock.less");

//const ReactDOM = require("react-dom");

const _portfolioSize = 4890000;
const _risc = 0.25;
var _perc = 0.0;

var _ATR;
var _stockID;
var _stockQuote;
var _xrate = 9.72;

const _stoplossType = {
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

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        
        this.state = {focus:'stockticker', helpATR: "", helpReport: "", helpPercentage: "", helpQuote: "", title: "Ange källa", selectedOption: "option1", sourceID: null, sources: [], inputs:{}};
    }

	componentDidMount() {
        var self = this;
        var stoplossOption = "option1";
        var helpATR = "";
        var helpQuote = "";
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
		                    helpQuote = _stockQuote;
							sourceText = sources.find(source => source.id === body[0].källa).text;
		                    self.setState({helpATR: helpATR, helpQuote: helpQuote, selectedOption: stoplossOption, sourceID: body[0].källa, title: sourceText});
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
            rec.stoplossProcent = this.state.inputs.stoplosspercentage/100;
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
        
        if (changeEvent.target.value == "option1") // ATR
			this.setPercentageHelp(this.state.inputs.atrmultiple, changeEvent.target.value);
        else if (changeEvent.target.value == "option2") // Fixed quote
			this.setPercentageHelp(this.state.inputs.stoplossquote, changeEvent.target.value);        
        else // Trailing stoploss
			this.setPercentageHelp(this.state.inputs.stoplosspercentage, changeEvent.target.value);
    }
    
	setPercentageHelp(val, option) {
        if (option == "option1")
	        _perc = ((1 - (_stockQuote/(_stockQuote-val*_ATR)))*100).toFixed(2);
        else if (option == "option2")
			_perc = ((1 - (_stockQuote/val))*100).toFixed(2);
		else
			_perc = -1*val;
	    
	    this.setState({helpPercentage: _perc + "%"});
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


        if (event.target.id == 'atrmultiple') {	        
	        if (!Number.isNaN(_stockQuote) && !Number.isNaN(event.target.value) && event.target.value != "" && !Number.isNaN(_ATR))
		        this.setPercentageHelp(event.target.value, 'option1');
	        else {
		        _perc = 0.0;
	            this.setState({helpPercentage: "n/a"});		        
	        }
        }
        
        if (event.target.id == 'stoplossquote') {	        
	        if (!Number.isNaN(_stockQuote) && !Number.isNaN(event.target.value) && event.target.value != "")
		        this.setPercentageHelp(event.target.value, 'option2');		        
	        else {
		        _perc = 0.0;
	            this.setState({helpPercentage: "n/a"});		        
	        }
        }
        
        if (event.target.id == 'stoplosspercentage')
			this.setPercentageHelp(event.target.value, 'option3');
                
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
                        var helpATR;
                        var helpReport;
                        var helpQuote;
        
						inputs.stockname = body.price.shortName;

						if (body.price.currency == 'USD')
							_xrate = 9.75;
						else if (body.price.currency == 'CAD')
							_xrate = 7.34;
						else if (body.price.currency == 'EUR')
							_xrate = 10.68;
						else if (body.price.currency == 'SEK')
							_xrate = 1;
						
						console.log("_xrate=", _xrate);
						
						self.setState({inputs:inputs});

                        _ATR = body.misc.atr14;
						_stockQuote = (body.price.regularMarketPrice).toFixed(2);
						
                        helpQuote = _stockQuote;
                        helpATR = ((_ATR/_stockQuote)*100).toFixed(2) + "% (" + _ATR + ")";
                        helpReport = getSweDate(body.calendarEvents.earnings.earningsDate[0]);

                        self.setState({helpATR: helpATR, helpReport: helpReport, helpQuote: helpQuote, focus:'stockprice'});
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

	                    <Form.Group>
	                        <Form.Row>
	                            <Form.Group xs={12} sm={12} md={6}>
	                                <Card>
								        <Card.Header>
											Stop Loss
								        </Card.Header>                                
	                                    <Card.Body>
	                                    
										<Form inline padding={{vertical:1}}>                                    	
		                                    <Form.Radio value="option1" checked={this.state.selectedOption === "option1"} onChange={this.handleOptionChange}>
		                                        Släpande
		                                    </Form.Radio>
		
		                                    <Form.Input value={this.state.inputs.atrmultiple} margin={{left:2, right:2}} type="text" ref="atrmultiple" id="atrmultiple" placeholder="x ATR?" onChange={this.onTextChange.bind(this)}/>
		                                </Form>
	
										<Form inline padding={{vertical:1}}>                                    	
		                                    <Form.Radio value="option2" checked={this.state.selectedOption === "option2"} onChange={this.handleOptionChange}>
		                                        Under kurs
		                                    </Form.Radio>
		
		                                    <Form.Input value={this.state.inputs.stoplossquote} margin={{bottom:0, left:2, right:2}} type="text" ref="stoplossquote" id="stoplossquote" placeholder="Kurs?" onChange={this.onTextChange.bind(this)}/>
		                                </Form>
		                                                                
										<Form inline padding={{vertical:1}}>                                    	
		                                    <Form.Radio value="option3" checked={this.state.selectedOption === "option3"} onChange={this.handleOptionChange}>
		                                        Släpande under procent
		                                    </Form.Radio>
		                                    <Form.Input  value={this.state.inputs.stoplosspercentage} margin={{left:2, right:2}} type="text" ref="stoplosspercentage" id="stoplosspercentage" placeholder="%" onChange={this.onTextChange.bind(this)}/>
										</Form>
										
	                                    </Card.Body>
	                                </Card>
	                            </Form.Group>
	                            <Form.Group xs={12} sm={12} md={6}>
	                                <Card>
										<Card.Header>
										Info
										</Card.Header>
	                                    <Card.Body>
											<Container>
										        <Container.Row>
										            <Container.Col text="info text-right font-weight-light">Kurs nu</Container.Col>
										            <Container.Col>{this.state.helpQuote}</Container.Col>
										            <Container.Col text="info text-right font-weight-light">Rapport</Container.Col>
										            <Container.Col text="float-left">{this.state.helpReport}</Container.Col>										            
										        </Container.Row>
										        <Container.Row>
										            <Container.Col text="info text-right font-weight-light">ATR</Container.Col>
										            <Container.Col>{this.state.helpATR}</Container.Col>
										            <Container.Col text="info text-right font-weight-light">Risk</Container.Col>
										            <Container.Col>{this.state.helpPercentage > 0 ? "-" + this.state.helpPercentage : this.state.helpPercentage}</Container.Col>										            
										        </Container.Row>
										        <Container.Row>
										            <Container.Col text="info text-right font-weight-light">Köpesumma</Container.Col>
										            <Container.Col>{Math.trunc((_risc*_portfolioSize)/(Math.abs(_perc))) > _portfolioSize? _portfolioSize.toLocaleString() : Math.trunc((_risc*_portfolioSize)/(Math.abs(_perc))).toLocaleString()}</Container.Col>
										            <Container.Col text="info text-right font-weight-light">Antal</Container.Col>
										            <Container.Col>{Math.trunc(((_risc*_portfolioSize)/(Math.abs(_perc))/_xrate)/_stockQuote).toLocaleString()}</Container.Col>										            
										        </Container.Row>
										    </Container>	                                    
	                                    </Card.Body>
	                                </Card>
	                            </Form.Group>
	                        </Form.Row>
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

