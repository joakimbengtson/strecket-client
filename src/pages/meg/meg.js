import React from 'react';
import StockChartList from './stock-chart-list.js';
import Request from 'yow/request';



class NagotSomFunkar extends React.Component {

	constructor(props) {
		super(props);

		this.state = {spikes:[], spikesFetched: false};
	};

	getSpikes() {
        // Gjorde om getSpikes() till en Promise istället.
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var spikes = [];

	        query.sql    = 'SELECT a.symbol, a.volume, b.volume, a.close as lastClose, b.close as previousClose FROM stockquotes a INNER JOIN stockquotes b ON a.symbol = b.symbol WHERE a.date = ? AND b.date = ? AND a.volume > b.AV14*2 AND a.close > b.close AND a.close > a.SMA200 AND a.close*a.AV14 > 5000000';
	        query.values = ['2018-08-31', '2018-08-30'];

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
        // Måste anropa getSpikes() med this.getSpikes()
        this.getSpikes().then(spikes => {
            this.setState({spikes:spikes, spikesFetched:true});
        })
        .catch(error => {
            console.log(error);

            // Om något fel inträffat kommer bara en tom sida att visas.
            // Man borde göra något med att this.state innehåller ett felmeddelande som kan visas...
            this.setState({spikes:[], spikesFetched:true});
        });
    }

    render() {
        if (this.state.spikesFetched) {
	        return (
                <StockChartList symbols={this.state.spikes}/>
	        );
	    }

        // Måste alltid returnera HTML i metoden render()
        else {
            return <div>Vänta, snart klar. Eller varför inte visa en spinner?!</div>
        }
    }
}

class NagotSomFunkarBattreOmNagotBlirFel extends React.Component {

	constructor(props) {
		super(props);

		this.state = {spikes:null, error: null};
	};

	getSpikes() {
        return new Promise((resolve, reject) => {
	        var request = new Request('http://app-o.se:3012');
	        var query = {};
	        var spikes = [];

	        query.sql    = 'SELECT a.symbol, a.volume, b.volume, a.close as lastClose, b.close as previousClose FROM stockquotes a INNER JOIN stockquotes b ON a.symbol = b.symbol WHERE a.date = ? AND b.date = ? AND a.volume > b.AV14*2 AND a.close > b.close AND a.close > a.SMA200 AND a.close*a.AV14 > 5000000';
	        query.values = ['2018-08-31', '2018-08-30'];

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
        this.getSpikes().then(spikes => {
            this.setState({spikes:spikes});
        })
        .catch(error => {
            console.log(error);
            this.setState({error:error});
        });
    }

    render() {
        if (this.state.spikes) {
	        return (
                <StockChartList symbols={this.state.spikes}/>
	        );
	    }
        else if (this.state.error) {
            // Försök visa felet på något sätt...
            return <div>{this.state.error.message}</div>
        }

        else {
            return <div>Vänta, snart klar. Eller varför inte visa en spinner?!</div>
        }
    }
}

//module.exports = NagotSomFunkar;
module.exports = NagotSomFunkarBattreOmNagotBlirFel;