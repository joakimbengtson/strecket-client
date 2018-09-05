import React from 'react';
import StockChartList from './stock-chart-list.js';
import Request from 'yow/request';



// <StockChartList symbols={['AAPL', 'TSLA', '^OMX', 'T']}/>

module.exports = class Module extends React.Component {
	
	constructor(props) {
		super(props);
				
		this.state = {spikes:[], spikesFetched: false};
	};

	getSpikes() {
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
	            
	            this.spikesFetched = true;
	            
	            return spikes;
	        })
	        .catch(error => {
	            console.log(error);
	        })
	
	}
	
	componentDidMount() {
        const self = this;
        getSpikes(data => self.setState({ spikes: spikes }));
    }	

    render() {
        if (this.state.spikesFetched) {
	        return (
	        	<StockChartList symbols={this.state.spikes}/>
	        );
	    }
    }
}
