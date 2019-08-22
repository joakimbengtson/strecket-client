import React from 'react';
import ReactHighcharts from 'react-highcharts';
import ReactHighstock from 'react-highcharts/ReactHighstock';
import Indicators from 'highcharts/indicators/indicators';

Indicators(ReactHighstock.Highcharts);

import Request from 'yow/request';
import sprintf from 'yow/sprintf';
import InfoBox from './info-box.js';

module.exports = class StockChart extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};

        // ready = false, dvs vi har inte läst in data än...
        this.state.ready = false;

        this.state.config = {};
        
        this.state.atr = 0;
        
        this.state.drops = [];

        // Hämta parametrar från anropet <StockChart symbol='X'/>
        this.state.symbol = this.props.symbol;
        this.state.sectors = this.props.sectors;
    }

    // Anropas efter konponenten är skapad och finns i DOM:en
    componentDidMount() {
        this.generate();
    }

    generate() {
        // Deklarera en request som går direkt till Munch (slipper då MySQL-anrop)
        var request = new Request('http://app-o.se:3012');

        // Nu och då
        var now = new Date();
        var then = new Date();
		var oneYearAgo = new Date();

        // Då är två år tillbaka i tiden, vi hämtar 2 år men visar 1, pga SMA200 visas inte korrekt annars
        then.setFullYear(now.getFullYear() - 2);
        
        // Håll koll på ett år tillbaks, vi visar bara ett år i grafen
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        // Skapa läsbara texter från nu och då
        var nowYMD  = sprintf('%04d-%02d-%02d', now.getFullYear(), now.getMonth() + 1, now.getDate());
        var thenYMD = sprintf('%04d-%02d-%02d', then.getFullYear(), then.getMonth() + 1, then.getDate());
        var yearAgoYMD = sprintf('%04d-%02d-%02d', oneYearAgo.getFullYear(), oneYearAgo.getMonth() + 1, oneYearAgo.getDate());

        // Skapa frågan
        var query = {};
        query.sql        = 'select date, open, high, low, close, volume from quotes where symbol = ? and date >= ?';
        query.values     = [this.state.symbol, thenYMD];
var _symb = this.state.symbol;
        var data = [];
        var volume = [];

        // Hämta data från Munch via ett '/mysql' anrop...
        request.get('/mysql', {query:query}).then(response => {
            var stocks = response.body;
            var prevClose;
            var maxP = 0;
            var minP = 0;
            var directionFlip = false;
            var drops = [];
            var drop;

//console.log(_symb, "-------------------------------------------------------------------");
            
            const atrPeriod = 14; // ATR calculated for 14 days

            // Lägg till i vektorn 'data' på det format som Highcharts vill ha det
            stocks.forEach((stock, index) => {
                var date = new Date(stock.date);
                data.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), stock.open, stock.high, stock.low, stock.close, stock.volume]);
                volume.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), stock.volume]);
                
                
                // Calculate ATR
                if (stocks.length-index < atrPeriod+1) {
	                this.state.atr = this.state.atr + Math.max(stock.high-stock.low, Math.abs(stock.high-prevClose), Math.abs(stock.low-prevClose));
	                prevClose = stock.close;	                
                }
                else
	                prevClose = stock.close;           
	                
	            // Calculate maxdrop
	            if (stocks.length-index < 100) {
//console.log("Kollar ", stock.date, stock.close);		            
		            if (directionFlip && stock.close > maxP) {
//			            console.log("Ny max efter flip", ((1 - (maxP/minP))*100).toFixed(2) + "%");
			            drop = ((1 - (maxP/minP))*100).toFixed(2);
			            drops.push(drop);
		            	maxP = stock.close;
		            	minP = 0;
		            	directionFlip = false;
		            } else if (stock.close > maxP) {
		            	maxP = stock.close;
//			            console.log("Nytt max", maxP);
		            }
		            else if (minP == 0 || stock.close < minP) {
		            	minP = stock.close;			            
//			            console.log("Nytt min", minP);			             
		            	directionFlip = true;
		            }
					
				}	            
                
            });
// console.log("---", _symb, drops, Math.min.apply(null, drops));             
            this.state.atr = this.state.atr / atrPeriod;
            this.state.drops = drops;

            // Skapa en Highcharts 'config'...
            var config = {
              title: {
                text: this.state.symbol
              },

              subtitle: {
                  text: sprintf('%s - %s', yearAgoYMD, nowYMD)
              },

			  chart: {
			    height: (9 / 16 * 100) + '%',
			    panning: false
			  },

			  rangeSelector: {
			    enabled: false
			  },

			  navigator: {
			    enabled: false
			  },

			  tooltip: {
			    enabled: true
			  },

		      scrollbar: {
		      	enabled: false
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

	        yAxis: [{

	            labels: {
	                align: 'right',
	                x: -3
	            },
	            height: '75%',
	            lineWidth: 2,
	            resize: {
	                enabled: true
	            }
	        }, {
	            labels: {
	                align: 'right',
	                x: -3
	            },
	            top: '65%',
	            height: '25%',
	            offset: 0,
	            lineWidth: 2
	        }],

			plotOptions: {

		        series: {
					allowPointSelect: false,
		            dashStyle: 'solid',
					enableMouseTracking: false,
		            marker: {
		                enabled: false,
			            states: {
			                select: {
			                    enabled: false
			                },
			                hover: {
			                    enabled: false,
			                    halo: {
									size: 0
								}
			                },
			                normal: {
			                    animation: false
			                }
			                
			            }
		            }
		            
		        },

				ohlc: {
				    color: 'red',
				    upColor: 'green',
				    lineWidth: 2
                }
			},

            series: [
              	{
	                name: this.state.symbol,
	                id: 'STOCK',
	                type: 'ohlc',
	                data: data,
            	},
				{
		            name: 'Volym',
		            type: 'column',
		            data: volume,
		            yAxis: 1,
	        	},
				{ 
					name: 'sma50',
		            type: 'sma',
		            color: 'green',	
		            lineWidth: 2,
		            linkedTo: 'STOCK',
		            params: {
		            	period: 50
		            }
	        	},
				{ 
					name: 'sma14',
		            type: 'sma',
		            color: 'red',	
		            lineWidth: 4,
		            linkedTo: 'STOCK',
		            params: {
		            	period: 200
		            }
		            
	        	}
	        ]

            };
            
            config.xAxis.min = Date.UTC(oneYearAgo.getFullYear(), oneYearAgo.getMonth(), oneYearAgo.getDate());
            
            // Sätt denna komponents 'tillstånd' till klar och datan finns under 'config'...
            this.setState({ready:true, config:config});
        })
        .catch(error => {
            console.error(error.message);
        })

    }

    render() {
        if (this.state.ready) {

            var style = {};
            style.border = '1px solid rgba(0, 0, 0, 0.1)';
            style.marginLeft = '10em';
            style.marginRight = '10em';
            style.marginTop = '5em';
            style.marginBottom = '5em';

            return (
                <div style = {style}>
                    <ReactHighstock config={this.state.config} ref="chart"></ReactHighstock>
                    <InfoBox symbol={this.state.symbol} sectors={this.state.sectors} atr={this.state.atr} drops={this.state.drops}></InfoBox>

                </div>
            );

        }
        // Annars visa en tom graf...
        else {
            return (<div></div>);
        }
    }



}
