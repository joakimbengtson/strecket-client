import React from 'react';
import ReactHighcharts from 'react-highcharts';
import ReactHighstock from 'react-highcharts/ReactHighstock';
import Request from 'yow/request';
import sprintf from 'yow/sprintf';


module.exports = class StockChart extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};
        this.state.ready = false;
        this.state.config = {};
        this.state.symbol = this.props.symbol;

    }

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

        var nowYMD = sprintf('%04d-%02d-%02d', now.getFullYear(), now.getMonth() + 1, now.getDate());
        var thenYMD = sprintf('%04d-%02d-%02d', then.getFullYear(), then.getMonth() + 1, then.getDate());

        query.sql        = 'select date, close from quotes where symbol = ? and date >= ?';
        query.values     = [this.state.symbol, thenYMD];

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
                  text: sprintf('%s - %s', thenYMD, nowYMD)
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
                </div>
            );

        }
        else {
            return (<div></div>);
        }
    }



}
