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

        this.state.symbol = this.props.symbol;
        this.state.sectors = this.props.sectors;
    }
    
    getColor(percentage) {
	    const climateGood = "table-success";
	    const climateAcceptable = "table-warning";
	    const climateBad = "table-danger";
	    
	    var p = parseFloat(percentage);

        if (p >= 0.7) return climateGood;

        if (p >= 0.5) return climateAcceptable;

        else return climateBad;
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
    
    getStatistics(stockInfo) {

		var pegRatio              = this.state.rawDump.defaultKeyStatistics.pegRatio;
		var sharesShort           = this.state.rawDump.defaultKeyStatistics.sharesShort;
		var sharesShortPriorMonth = this.state.rawDump.defaultKeyStatistics.sharesShortPriorMonth;
		
		var dividendYield         = this.state.rawDump.summaryDetail.dividendYield;
		var marketCap             = this.state.rawDump.summaryDetail.marketCap;

		var currentRatio          = this.state.rawDump.financialData.currentRatio;
		var quickRatio            = this.state.rawDump.financialData.quickRatio;
		var debtToEquity          = this.state.rawDump.financialData.debtToEquity;
		
		var longName              = this.state.rawDump.price.longName;

		var sector                = this.state.rawDump.summaryProfile.sector;
		var industry              = this.state.rawDump.summaryProfile.industry;
		var longBusinessSummary   = this.state.rawDump.summaryProfile.longBusinessSummary;

		var forwardPE             = this.state.rawDump.summaryDetail.forwardPE;
		var trailingPE            = this.state.rawDump.summaryDetail.trailingPE;

	
		stockInfo.push({"pegRatio": pegRatio, "pegRatio_OK": pegRatio <= 1.2});
		
		stockInfo.push({"sharesShort": parseFloat((1 - (sharesShortPriorMonth/sharesShort))*100).toFixed(2), "sharesShort_OK": sharesShort<sharesShortPriorMonth});
		
		stockInfo.push({"dividendYield": (dividendYield * 100).toFixed(2), "dividendYield_OK": dividendYield !== undefined});

		stockInfo.push({"currentRatio": currentRatio, "currentRatio_OK": currentRatio <= 1});
		stockInfo.push({"quickRatio":   quickRatio,   "quickRatio_OK":   quickRatio >= 1});
		stockInfo.push({"debtToEquity": debtToEquity, "debtToEquity_OK": debtToEquity < 35});
		
		stockInfo.push({"forwardPE":  forwardPE,  "forwardPE_OK":  forwardPE < 15});
		stockInfo.push({"trailingPE": trailingPE, "trailingPE_OK": trailingPE < 25});
		stockInfo.push({"marketCap": marketCap,   "marketCap_OK":  marketCap < 5000000000}); // Market Cap < $5 billion
		
		stockInfo.push({"longName": longName});
		stockInfo.push({"sector": sector});
		stockInfo.push({"industry": industry});
		stockInfo.push({"longBusinessSummary": longBusinessSummary});
				
		console.log(stockInfo);
		
    }

    render() {
        var self = this;
        var stockInfo = [];
        	    
        if (this.state.ready) {
            var style = {};
            style.border = "1px solid rgba(0, 0, 0, 0.1)";
            style.marginLeft = "10em";
            style.marginRight = "10em";
            style.marginTop = "5em";
            style.marginBottom = "5em";
        
			self.getStatistics(stockInfo);
                        
            var x = this.state.rawDump.summaryProfile.industry;
            
			var sector = this.state.sectors.find(sector => sector.industry == x);

            return (
                <div style={style}>
                    <Table bordered={true} responsive={true} size={'sm'}>
                        <tbody>
                            <tr>
                                {this.state.rawDump.defaultKeyStatistics.pegRatio >= 0 && this.state.rawDump.defaultKeyStatistics.pegRatio <= 1.2 ? (
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
                                {this.state.rawDump.financialData.currentRatio >= 0 && this.state.rawDump.financialData.currentRatio <= 1 ? (
                                    <td className="table-danger">
                                        <h3 className="text-white text-center">{"Current ratio: " + this.state.rawDump.financialData.currentRatio}</h3>
                                    </td>
                                ) : (
                                    <td className="table-success">
                                        <h3 className="text-white text-center">{"Current ratio:" + this.state.rawDump.financialData.currentRatio}</h3>
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
                                {this.state.rawDump.summaryDetail.fiftyTwoWeekHigh <= this.state.rawDump.price.regularMarketPrice ? (
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
                                <td className={self.getColor(sector.perc)}>{this.state.rawDump.summaryProfile.industry}</td>
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

