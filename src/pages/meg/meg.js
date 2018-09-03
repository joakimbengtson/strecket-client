import React from 'react';
import StockChartList from './stock-chart-list.js';



module.exports = class Module extends React.Component {

    render() {
        return (
            <StockChartList symbols={['AAPL', 'TSLA', '^OMX', 'T']}/>
        );
    }
}
