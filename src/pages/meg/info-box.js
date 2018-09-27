import React from 'react';
import ReactHighcharts from 'react-highcharts';
import ReactHighstock from 'react-highcharts/ReactHighstock';


import Request from 'yow/request';
import sprintf from 'yow/sprintf';


module.exports = class InfoBox extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};

        // ready = false, dvs vi har inte läst in data än...
        this.state.ready = false;
        this.state.companyName = null;

        // Hämta parametrar från anropet <StockChart symbol='X'/>
        this.state.symbol = this.props.symbol;
    }

    fetch() {
        return new Promise((resolve, reject) => {
            // Deklarera en request som går direkt till Munch (slipper då MySQL-anrop)
            var request = new Request('http://app-o.se:3000');


            // Hämta data från Munch via ett '/query' anrop...
            request.get('/company/' + this.state.symbol).then(response => {
                resolve(response.body);
            })
            .catch ((error) => {
                reject(error);
            })
        });
    }

    // Anropas efter konponenten är skapad och finns i DOM:en
    componentDidMount() {
        this.setState({ready:false});

        this.fetch().then((companyName) => {
            this.setState({companyName:companyName, ready:true});

        })
        .catch((error) => {
            this.setState({ready:true});

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
            style.backgroundColor = 'snow';

            // Returnera grafen med angiven stil och genererad data...
            return (
                <div style = {style}>
                    {this.state.companyName}
                </div>
            );

        }
        // Annars visa en tom graf...
        else {
            return (<div>-</div>);
        }
    }



}
