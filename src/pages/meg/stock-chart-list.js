import React from 'react';
import StockChart from './stock-chart.js';

module.exports = class StockChartList extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};
        this.state.symbols = this.props.symbols;
    }

    render() {
        var children = this.state.symbols.map((symbol, index) => {
            return (
                <StockChart key={index} symbol={symbol}></StockChart>
            );
        });

        return (
            <div>
                {children}
            </div>
        );
    }
}
