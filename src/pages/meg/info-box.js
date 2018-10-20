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
            var test;
            return (
                <div style={style}>
                    <Table bordered={true} condensed={true} responsive={true}>
                        <tbody>
                            <tr>
                                {this.state.rawDump.defaultKeyStatistics.pegRatio >= 0 && this.state.rawDump.defaultKeyStatistics.pegRatio <= 1 ? (
                                    <td>
                                        <Alert color="success">{"PEG: " + this.state.rawDump.defaultKeyStatistics.pegRatio}</Alert>
                                    </td>
                                ) : (
                                    <td>
                                        <Alert color="danger">{"PEG:" + this.state.rawDump.defaultKeyStatistics.pegRatio}</Alert>
                                    </td>
                                )}
                                {this.state.rawDump.summaryDetail.dividendYield !== undefined ? (
                                    <td>
                                        <Alert color="success">{"Utdelning: " + (this.state.rawDump.summaryDetail.dividendYield * 100).toFixed(2)}%</Alert>
                                    </td>
                                ) : (
                                    <td>
                                        <Alert color="danger">{"Utdelning: 0"}</Alert>
                                    </td>
                                )}
                                {this.state.rawDump.defaultKeyStatistics.currentRatio >= 0 && this.state.rawDump.defaultKeyStatistics.currentRatio <= 1 ? (
                                    <td>
                                        <Alert color="success">{"Current ratio: " + this.state.rawDump.defaultKeyStatistics.currentRatio}</Alert>
                                    </td>
                                ) : (
                                    <td>
                                        <Alert color="danger">{"Current ratio:" + this.state.rawDump.defaultKeyStatistics.currentRatio}</Alert>
                                    </td>
                                )}
                            </tr>
                            <tr>
                                {this.state.rawDump.financialData.quickRatio >= 1 ? (
                                    <td>
                                        <Alert color="success">{"Quick Ratio: " + this.state.rawDump.financialData.quickRatio}</Alert>
                                    </td>
                                ) : (
                                    <td>
                                        <Alert color="danger">{"Quick Ratio:" + this.state.rawDump.financialData.quickRatio}</Alert>
                                    </td>
                                )}
                                {this.state.rawDump.defaultKeyStatistics.sharesShort < this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth ? (
                                    <td>
                                        <Alert color="success">
                                            {"Blankare minskar" +
                                                this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth +
                                                "->" +
                                                this.state.rawDump.defaultKeyStatistics.sharesShort}
                                        </Alert>
                                    </td>
                                ) : (
                                    <td>
                                        <Alert color="danger">
                                            {"Blankare ökar" +
                                                this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth +
                                                "->" +
                                                this.state.rawDump.defaultKeyStatistics.sharesShort}
                                        </Alert>
                                    </td>
                                )}
                            </tr>
                            <tr>
                                <td>
                                    <Alert color="info">{this.state.rawDump.price.longName}</Alert>
                                </td>
                                <td>{this.state.rawDump.summaryProfile.sector}</td>
                                <td>{this.state.rawDump.summaryProfile.industry}</td>
                            </tr>
                            <tr>
                                <td colSpan="3">
                                    <Alert color="info">
                                        <small>{this.state.rawDump.summaryProfile.longBusinessSummary}</small>
                                    </Alert>
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

