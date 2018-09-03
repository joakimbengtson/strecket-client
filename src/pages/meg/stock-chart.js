import React from 'react';
import ReactHighcharts from 'react-highcharts';
import ReactHighstock from 'react-highcharts/ReactHighstock';
import Request from 'yow/request';
import sprintf from 'yow/sprintf';


module.exports = class StockChart extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};
        // ready = false, dvs vi har inte läst in data än...
        this.state.ready = false;

        // config = tomt än så länge.
        this.state.config = {};

        // Hämta parametrar från anropet <StockChart symbol='X'/>
        this.state.symbol = this.props.symbol;
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

        // Då är ett år tillbaka i tiden
        then.setFullYear(now.getFullYear() - 1);

        // Skapa läsbara texter från nu och då
        var nowYMD = sprintf('%04d-%02d-%02d', now.getFullYear(), now.getMonth() + 1, now.getDate());
        var thenYMD = sprintf('%04d-%02d-%02d', then.getFullYear(), then.getMonth() + 1, then.getDate());

        // Skapa frågan
        var query = {};
        query.sql        = 'select date, close from quotes where symbol = ? and date >= ?';
        query.values     = [this.state.symbol, thenYMD];

        var data = [];

        // Hämta data från Munch via ett '/query' anrop...
        request.get('/query', {query:query}).then(response => {
            var stocks = response.body;

            // Lägg till i vektorn 'data' på det format som Highcharts vill ha det
            stocks.forEach(stock => {
                var date = new Date(stock.date);
                data.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), stock.close]);
            });

            // Skapa en Highcharts 'config'...
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

            // Sätt denna komponents 'tillstånd' till klar och datan finns under 'config'...
            this.setState({ready:true, config:config});
        })
        .catch(error => {
            console.log(error);
        })

    }

    render() {
        // Om allt är klart så...
        if (this.state.ready) {

            // Lite styling kring grafen
            var style = {};
            style.border = '1px solid rgba(0, 0, 0, 0.1)';
            style.marginLeft = '10em';
            style.marginRight = '10em';
            style.marginTop = '5em';
            style.marginBottom = '5em';

            // Returnera grafen med angiven stil och genererad data...
            return (
                <div style = {style}>
                    <ReactHighstock config={this.state.config} ref="chart"></ReactHighstock>
                </div>
            );

        }
        // Annars visa en tom graf...
        else {
            return (<div></div>);
        }
    }



}
