import React from 'react';
import ReactHighcharts from 'react-highcharts';
import ReactHighstock from 'react-highcharts/ReactHighstock';
import {Table, thead, td, tr, th} from 'react-bootstrap';


import Request from 'yow/request';
import sprintf from 'yow/sprintf';


module.exports = class InfoBox extends React.Component {

    constructor(args) {
        super(args);

        this.state = {};

        // ready = false, dvs vi har inte läst in data än...
        this.state.ready = false;
        this.state.rawDump = null;

        // Hämta parametrar från anropet <StockChart symbol='X'/>
        this.state.symbol = this.props.symbol;
    }

    fetch() {
        return new Promise((resolve, reject) => {
            var request = new Request('http://app-o.se:3000');


            request.get('/rawdump/' + this.state.symbol).then(response => {
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

        this.fetch().then((rawDump) => {
            this.setState({rawDump:rawDump, ready:true});

        })
        .catch((error) => {
            this.setState({ready:true});

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
            style.backgroundColor = 'snow';

            return (
                <div style = {style}>
					<Table striped={true} bordered={true} condensed={true} responsive={true}>
				
				    <tbody>
						<tr>												
							{(this.state.rawDump.defaultKeyStatistics.pegRatio >= 0 && this.state.rawDump.defaultKeyStatistics.pegRatio <= 1)? <td style={{backgroundColor: 'green'}}>{'PEG:' + this.state.rawDump.defaultKeyStatistics.pegRatio}</td> : <td style={{backgroundColor: 'red'}}>{'PEG:' + this.state.rawDump.defaultKeyStatistics.pegRatio}</td>}						
						
						</tr>
					</tbody>
		
					</Table>
                                    
                </div>
            );

        }
        else {
            return (<div>-</div>);
        }
    }

}
