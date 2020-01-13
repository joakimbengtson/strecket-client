import React from 'react';
import StockChart from './stock-chart.js';


module.exports = class StockChartList extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};
        this.state.symbols = this.props.symbols;
        this.state.sectors = this.props.sectors;
        this.state.callback = this.props.callback;
    }
    
    render() {
        var children = this.state.symbols.map((symbol, index) => {
            return (
	        	<StockChart key={index} symbol={symbol} sectors={this.state.sectors} callback={this.state.callback}></StockChart>
            );
        });

        return (
            <div>
                {children}
            </div>
        );
    }
}
