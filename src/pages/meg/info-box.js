import React from "react";
import ReactHighcharts from "react-highcharts";
import ReactHighstock from "react-highcharts/ReactHighstock";

import {Table, Alert} from "react-bootify";

import Request from "yow/request";
import sprintf from "yow/sprintf";

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
            var request = new Request("http://app-o.se:3000");

            request
                .get("/rawdump/" + this.state.symbol)
                .then(response => {
                    resolve(response.body);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    // Anropas efter konponenten är skapad och finns i DOM:en
    componentDidMount() {
        this.setState({ready: false});

        this.fetch()
            .then(rawDump => {
                this.setState({rawDump: rawDump, ready: true});
            })
            .catch(error => {
                this.setState({ready: true});
            });
    }

    render() {
        if (this.state.ready) {
            var style = {};
            style.border = "1px solid rgba(0, 0, 0, 0.1)";
            style.marginLeft = "10em";
            style.marginRight = "10em";
            style.marginTop = "5em";
            style.marginBottom = "5em";

            return (
                <div style={style}>
                    <Table bordered={true} responsive={true} size={'sm'}>
                        <tbody>
                            <tr>
                                {this.state.rawDump.defaultKeyStatistics.pegRatio >= 0 && this.state.rawDump.defaultKeyStatistics.pegRatio <= 1 ? (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"PEG: " + this.state.rawDump.defaultKeyStatistics.pegRatio}</h3>
                                    </td>
                                ) : (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"PEG:" + this.state.rawDump.defaultKeyStatistics.pegRatio}</h3>
                                    </td>
                                )}
                                {this.state.rawDump.summaryDetail.dividendYield !== undefined ? (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"Utdelning: " + (this.state.rawDump.summaryDetail.dividendYield * 100).toFixed(2)}%</h3>
                                    </td>
                                ) : (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"Utdelning: 0"}</h3>
                                    </td>
                                )}
                                {this.state.rawDump.defaultKeyStatistics.currentRatio >= 0 && this.state.rawDump.defaultKeyStatistics.currentRatio <= 1 ? (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"Current ratio: " + this.state.rawDump.defaultKeyStatistics.currentRatio}</h3>
                                    </td>
                                ) : (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"Current ratio:" + this.state.rawDump.defaultKeyStatistics.currentRatio}</h3>
                                    </td>
                                )}
                            </tr>
                            <tr>
                                {this.state.rawDump.financialData.quickRatio >= 1 ? (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"Quick Ratio: " + this.state.rawDump.financialData.quickRatio}</h3>
                                    </td>
                                ) : (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"Quick Ratio:" + this.state.rawDump.financialData.quickRatio}</h3>
                                    </td>
                                )}
                                {this.state.rawDump.defaultKeyStatistics.sharesShort < this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth ? (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"Blankare minskar: " +
                                            parseFloat((1 - (this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth / this.state.rawDump.defaultKeyStatistics.sharesShort))*100).toFixed(2)}%
                                        </h3>
                                    </td>
                                ) : (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"Blankare ökar: " +
                                            parseFloat((1 - (this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth / this.state.rawDump.defaultKeyStatistics.sharesShort))*100).toFixed(2)}%
                                        </h3>                                            
                                    </td>
                                )}
                                {this.state.rawDump.summaryDetail.fiftyTwoWeekHigh < this.state.rawDump.price.regularMarketPrice ? (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"> 52 veckor"}
                                        </h3>
                                    </td>
                                ) : (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"< 52 veckor"}
                                        </h3>                                            
                                    </td>
                                )}
                            </tr>
                            <tr>
                                <td className="table-primary">
                                    {this.state.rawDump.price.longName}
                                </td>
                                <td className="table-primary">{this.state.rawDump.summaryProfile.sector}</td>
                                <td className="table-primary">{this.state.rawDump.summaryProfile.industry}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="table-primary">
                                	<small>{this.state.rawDump.summaryProfile.longBusinessSummary}</small>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            );
        } else {
            return <div>-</div>;
        }
    }
};

