import React from "react";
import ReactHighcharts from "react-highcharts";
import ReactHighstock from "react-highcharts/ReactHighstock";

import {Table, Alert, Spinner} from "react-bootify";

import Request from "yow/request";
import sprintf from "yow/sprintf";

module.exports = class InfoBox extends React.Component {
	
    constructor(args) {
        super(args);

        this.state = {}; 

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

		var forwardPE             = (this.state.rawDump.summaryDetail.forwardPE !== undefined) ? this.state.rawDump.summaryDetail.forwardPE : 0;
		var trailingPE            = (this.state.rawDump.summaryDetail.trailingPE !== undefined) ? this.state.rawDump.summaryDetail.trailingPE : 0;
		
		stockInfo.score = 0;
	
		stockInfo.pegRatio    = pegRatio;
		stockInfo.pegRatio_OK = (pegRatio <= 1.2 && pegRatio > 0);
		if (stockInfo.pegRatio_OK)
			++stockInfo.score
		
		stockInfo.sharesShort    = parseFloat((1 - (sharesShortPriorMonth/sharesShort))*100).toFixed(2);
		stockInfo.sharesShort_OK = (sharesShort<sharesShortPriorMonth);
		if (stockInfo.sharesShort_OK)
			++stockInfo.score
		
		stockInfo.dividendYield    = (dividendYield * 100).toFixed(2);
		stockInfo.dividendYield_OK = (dividendYield !== undefined);
		if (stockInfo.dividendYield_OK)
			++stockInfo.score
		else
			stockInfo.dividendYield = 0;

		stockInfo.currentRatio    = currentRatio;
		stockInfo.currentRatio_OK = (currentRatio <= 1);
		if (stockInfo.currentRatio_OK)
			++stockInfo.score
		
		stockInfo.quickRatio    = quickRatio;
		stockInfo.quickRatio_OK = (quickRatio >= 1);
		if (stockInfo.quickRatio_OK)
			++stockInfo.score
		
		stockInfo.debtToEquity    = debtToEquity;
		stockInfo.debtToEquity_OK = (debtToEquity < 35);
		if (stockInfo.debtToEquity_OK)
			++stockInfo.score
		
		stockInfo.forwardPE    = (forwardPE).toFixed(0);
		stockInfo.forwardPE_OK = (forwardPE < 15 && forwardPE > 0);
		if (stockInfo.forwardPE_OK)
			++stockInfo.score
		
		stockInfo.trailingPE    = (trailingPE).toFixed(0);
		stockInfo.trailingPE_OK = (trailingPE < 25 && trailingPE > 0);
		if (stockInfo.trailingPE_OK)
			++stockInfo.score
		
		stockInfo.marketCap    = Intl.NumberFormat("SE").format(marketCap);
		stockInfo.marketCap_OK = marketCap < 5000000000; // Market Cap < $5 billion
		if (stockInfo.marketCap_OK)
			++stockInfo.score
		
		stockInfo.longName            = longName;
		stockInfo.sector              = sector;
		stockInfo.industry            = industry;
		stockInfo.longBusinessSummary = longBusinessSummary;
						
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
            
			var sector = this.state.sectors.find(sector => sector.industry == x); // Är denna aktie i en trendande sektor, om så -> sektor.perc visar hur många aktier i sektorn som trendar upp
			
			if (sector.perc > 0.5)
				++stockInfo.score;

            return (
                <div style={style}>
                    <Table bordered={true} responsive={true} size={'sm'}>
                        <tbody>
                            <tr>
                                <td className={ stockInfo.pegRatio_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"PEG: " + stockInfo.pegRatio}</h3>
                                </td>
                                <td className={ stockInfo.dividendYield_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Utdelning: " + stockInfo.dividendYield}%</h3>
                                </td>
                                <td className={ stockInfo.currentRatio_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Current ratio: " + stockInfo.currentRatio}</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className={ stockInfo.quickRatio_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Quick ratio: " + stockInfo.quickRatio}</h3>
                                </td>
                                <td className={ stockInfo.sharesShort_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Blankare: " + stockInfo.sharesShort}%</h3>
                                </td>
                                <td className={ stockInfo.debtToEquity_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Skuld/Eget kapital: " + stockInfo.debtToEquity}</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className={ stockInfo.forwardPE_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Forward P/E: " + stockInfo.forwardPE}</h3>
                                </td>
                                <td className={ stockInfo.trailingPE_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Trailing P/E: " + stockInfo.trailingPE}</h3>
                                </td>
                                <td className={ stockInfo.marketCap_OK ? 'table-success' : 'table-danger'}>
                                    <h3 className="text-white text-center">{"Marknadsvärde: " + stockInfo.marketCap}</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="table-primary">
                                    {stockInfo.longName}
                                </td>
                                <td className="table-primary">{stockInfo.sector}</td>
                                <td className={self.getColor(sector.perc)}>{stockInfo.industry}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="table-primary">
                                	<small>{stockInfo.longBusinessSummary}</small>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="table-primary">
                                	<h1 className="text-center">{stockInfo.score}</h1>
                                </td>
                            </tr>

                        </tbody>
                    </Table>
                </div>
            );
        } else {
            return (<div>JBN</div>);
        }
    }

/* OLD
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
    }*/
};

