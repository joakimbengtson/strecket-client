import React from 'react';
import StockChartList from './stock-chart-list.js';
import Request from 'yow/request';

require('./meg.css'); 

var _descr1;


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

		this.state = {spikes:null, dates:null, error:null, sectors:[], tickers: ""};
		
		this.handleCheck = this.handleCheck.bind(this);
		this.handleChange = this.handleChange.bind(this);		
		
	};
	
	getSectors() {
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var sectors = [];
	        
	        query.sql = 'SELECT stocks.industry, sum(b.close>a.close)/count(b.close) as perc FROM stockquotes a INNER JOIN stockquotes b ON a.symbol = b.symbol INNER JOIN stocks ON stocks.symbol = a.symbol where a.date=? and b.date=? and sector <> "" and industry <> "" group by sector, industry order by perc desc';

	        query.values = [this.state.dates[0], this.state.dates[1]];

	        request.get('/mysql', {query:query}).then(response => {
	            sectors = response.body;
                resolve(sectors);
	        })
	        .catch(error => {
                reject(error);
	        })
        });
		
	}


	getDates() {
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var dates = [];

			// Räkna ut de två senaste datumen som har kurser och troligen inte är helg (dvs mer än 1000 rader)
	        query.sql = 'select distinct date from (SELECT COUNT(date) as c, date FROM stockquotes GROUP BY date HAVING c > 1000) tradeDays order by date desc limit 2';

	        request.get('/mysql', {query:query}).then(response => {

		        dates[0] = sweDate(new Date(response.body[0].date));
		        dates[1] = sweDate(new Date(response.body[1].date));

                resolve(dates);
	        })
	        .catch(error => {
                reject(error);
	        })
        });
	}
	/*
	getFearAndGreed() {
        return new Promise((resolve, reject) => {
	        
			const request = require('request');

			request('http://stackabuse.com', function(err, res, body) {  
			  console.log(body);
			});	        
	        
	        
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var dates = [];

	        request.get('/mysql', {query:query}).then(response => {

		        dates[0] = sweDate(new Date(response.body[0].date));
		        dates[1] = sweDate(new Date(response.body[1].date));

                resolve(dates);
	        })
	        .catch(error => {
                reject(error);
	        })
        });		
	}
*/
	getSpikes() {
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var spikes = [];
	        
			_descr1 = "50% över normal volym, stängt över gårdagen, över 51 week high, över sma200, omsatt mer än 5 miljoner $";
	        query.sql    = 'SELECT a.symbol, a.volume, b.volume, a.close as lastClose, b.close as previousClose FROM stockquotes a INNER JOIN stockquotes b ON a.symbol = b.symbol INNER JOIN stocks ON stocks.symbol = a.symbol WHERE a.date = ? AND b.date = ? AND a.volume > b.AV14*1.5 AND a.close > b.close AND a.close > a.SMA200 AND a.close*a.AV14 > 5000000 AND a.close > a.open AND a.close >= stocks.wh51';

	        query.values = [this.state.dates[0], this.state.dates[1]];

	        request.get('/mysql', {query:query}).then(response => {
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
			this.getSectors().then(sectors => {
		        this.setState({sectors:sectors});
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
	    })
        .catch(error => {
            console.log(error);
            this.setState({error:error});
        });

    }
    
	handleCheck = (childData) => {		
		this.setState({tickers: this.state.tickers == "" ? childData : this.state.tickers + ", " + childData});		
	}
	
	handleChange(event) {
		this.setState({tickers: event.target.value});
	}
	
    render() {
        if (this.state.spikes) {
	        
            var style = {};
            style.display = 'block';
            style.marginLeft = 'auto';
            style.marginRight = 'auto';
            style.resize = 'none';	        

	        return (
		        <div>
		        <h1 className="text-center">{this.state.dates[1] + " - " + this.state.dates[0] + " (" + this.state.spikes.length + " st)"}</h1>
		        <h4 className="text-center">({_descr1})</h4>
                <StockChartList symbols={this.state.spikes} sectors={this.state.sectors} tickers={this.state.tickers} callback={this.handleCheck}/>
                <textarea style={style} name="candidates" rows="4" cols="100" placeholder="Kandidater" value={this.state.tickers} onChange={this.handleChange}></textarea>
                </div>
	        );
	    }
        else if (this.state.error) {
            // Försök visa felet på något sätt...
            return <div>{this.state.error.message}</div>
        }

        else {
            var image = require('../candidates/images/spinner.gif')
            var imgStyle = {};
            imgStyle.marginLeft = 'auto';
            imgStyle.marginRight = 'auto';
            imgStyle.display = 'block';
            return <div style={{position:'absolute', width:'100%',  height:'100%'}}><img style={imgStyle} src={image}></img></div>
        }
    }
}

module.exports = NagotSomFunkarBattreOmNagotBlirFel;
