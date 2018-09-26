import React from 'react';
import StockChartList from './stock-chart-list.js';
import Request from 'yow/request';

require('./meg.css');


function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}


function sweDate(theDate) {
  var year = theDate.getFullYear();
  var month = theDate.getMonth()+1;
  var date = theDate.getDate();

  var time = year.toString() + '-' + pad(month) + '-' + pad(date);

  return time;
}


class NagotSomFunkarBattreOmNagotBlirFel extends React.Component { 
	
	constructor(props) {
		super(props);

		this.state = {spikes:null, dates:null, error: null};
	};
	
	getDates() {
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var dates = [];

			// Räkna ut de två senaste datumen som har kurser och troligen inte är helg (dvs mer än 200 rader)
	        //query.sql    = 'select distinct date from stockquotes order by date desc limit 2';
	        query.sql = 'select distinct date from (SELECT COUNT(date) as c, date FROM stockquotes GROUP BY date HAVING c > 200) tradeDays order by date desc limit 2';

	        request.get('/query', {query:query}).then(response => {

		        dates[0] = sweDate(new Date(response.body[0].date));
		        dates[1] = sweDate(new Date(response.body[1].date));	
		        	        
                resolve(dates);
	        })
	        .catch(error => {
                reject(error);
	        })
        });	
	}	

	getSpikes() {
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012'); 
	        var query = {};
	        var spikes = [];

	        query.sql    = 'SELECT a.symbol, a.volume, b.volume, a.close as lastClose, b.close as previousClose FROM stockquotes a INNER JOIN stockquotes b ON a.symbol = b.symbol WHERE a.date = ? AND b.date = ? AND a.volume > b.AV14*2 AND a.close > b.close AND a.close > a.SMA200 AND a.close*a.AV14 > 5000000';
	        query.values = [this.state.dates[0], this.state.dates[1]];
	         
	        request.get('/query', {query:query}).then(response => {
	            var tickers = response.body;
	            tickers.forEach(ticker => {
	                spikes.push(ticker.symbol);
	            });

                resolve(spikes);
	        })
	        .catch(error => {
                reject(error);
	        })
        });

	}
 
	componentDidMount() {
		
		this.getDates().then(dates => {		
	        this.setState({dates:dates});
	        this.getSpikes().then(spikes => {
	            this.setState({spikes:spikes});
	        })
	        .catch(error => {
	            console.log(error);
	            this.setState({error:error});
	        });
	    })
        .catch(error => {
            console.log(error);
            this.setState({error:error});
        });
				
    }

    render() {
        if (this.state.spikes) {
	        return (
		        <div> 
		        <h1 className="text-center">{this.state.dates[1] + " - " + this.state.dates[0] + " (" + this.state.spikes.length + " st)"}</h1>
                <StockChartList symbols={this.state.spikes}/>
                </div>
	        );
	    }
        else if (this.state.error) {
            // Försök visa felet på något sätt...
            return <div>{this.state.error.message}</div>
        }

        else {
            return <div id="over" style="position:absolute; width:100%; height:100%"><img src="../images/spinner.gif"></img></div>
        }
    }
}

module.exports = NagotSomFunkarBattreOmNagotBlirFel;