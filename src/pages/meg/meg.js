import React from 'react';
import ReactHighcharts from 'react-highcharts';
//import ReactHighstock from 'react-highcharts/ReactHighstock';
import Request from 'yow/request';
import sprintf from 'yow/sprintf';
import QueryString from 'querystring';


class StockChart extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};
        this.state.ready = false;
        this.state.config = {};
        this.state.symbol = 'AAPL';

    }

    /*
    componentDidUpdate(prevProps) {
        this.generate();
    }
    */

    componentDidMount() {
        this.generate();
    }


    generate() {
        var request = new Request('http://app-o.se:3012');
        var query = {};
        var params = {};
        var now = new Date();
        var then = new Date();

        then.setFullYear(now.getFullYear() - 1);

        query.sql        = 'select date, close from quotes where symbol = ? and date >= ?';
        query.values     = [this.state.symbol, sprintf('%04d-%02d-%02d', then.getFullYear(), then.getMonth() + 1, then.getDate())];

        var data = [];

        request.get('/query', {query:query}).then(response => {
            var stocks = response.body;

            stocks.forEach(stock => {
                var date = new Date(stock.date);
                data.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), stock.close]);
            });

            var config = {
              rangeSelector: {
                selected: 1
              },
              title: {
                text: this.state.symbol
              },
              subtitle: {
                  text: 'Ett år tillbaka'
              },

              yAxis: {
                  title: {
                      text: 'Värde'
                  }
              },
              xAxis: {
                  type: 'datetime',
                  dateTimeLabelFormats: {
                      month: '%b',
                      year: '%b'
                  },
                  title: {
                      text: 'Datum'
                  }
              },
              series: [{
                name: this.state.symbol,
                data: data,
                tooltip: {
                  valueDecimals: 2
                }
              }]
            };

            this.setState({ready:true, config:config});
        })
        .catch(error => {
            console.log(error);
        })

    }

    render() {
        if (this.state.ready)
            return (<ReactHighcharts config={this.state.config} ref="chart"></ReactHighcharts>)
        else {
            return (<div></div>);
        }
    }



}

module.exports = class Module extends React.Component {

    render() {
        return (
            <StockChart symbol='TSLA'/>
        );
    }
}
/*
module.exports = class Module extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};
        this.state.ready = false;
        this.state.config = {};
        this.content = undefined;

    }


    componentDidUpdate(prevProps) {
        this.foo();
    }

    componentDidMount() {
        this.foo();
    }

    foo() {
        console.log('Fetching stocks');
        var request = new Request('http://app-o.se:3012');
        var query = {};
        var params = {};
        var now = new Date();
        var then = new Date();

        if (this.content === this.props.location.search)
            return;

        this.content = this.props.location.search;


console.log('XXX', this.props.location.search);
        if (this.props.location.search) {
            params = QueryString.parse(this.props.location.search);

        }
        console.log('YYY', params);

        if (!params.symbol)
            params.symbol = 'AAPL';


console.log(params);
        then.setFullYear(now.getFullYear() - 1);
        console.log(then);

        query.sql        = 'select date, close from quotes where symbol = ? and date >= ?';
        query.values     = [params.symbol, sprintf('%04d-%02d-%02d', then.getFullYear(), then.getMonth() + 1, then.getDate())];

        var data = [];

        request.get('/query', {query:query}).then(response => {
            var stocks = response.body;

            stocks.forEach(stock => {
                var date = new Date(stock.date);
                data.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), stock.close]);
            });

            var config = {
              rangeSelector: {
                selected: 1
              },
              title: {
                text: params.symbol
              },
              subtitle: {
                  text: 'Ett år tillbaka'
              },

              yAxis: {
                  title: {
                      text: 'Värde'
                  }
              },
              xAxis: {
                  type: 'datetime',
                  dateTimeLabelFormats: {
                      month: '%b',
                      year: '%b'
                  },
                  title: {
                      text: 'Datum'
                  }
              },
              series: [{
                name: params.symbol,
                data: data,
                tooltip: {
                  valueDecimals: 2
                }
              }]
            };

            console.log(config.series)
            this.setState({ready:true, config:config});
        })
        .catch(error => {
            console.log(error);
        })

    }

    render() {
        if (this.state.ready)
            return (<ReactHighcharts config={this.state.config} ref="chart"></ReactHighcharts>)
        else {
            return (<div></div>);
        }
    }
}
*/
