import React, { Component } from 'react';
import _ from 'underscore'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import Paper from '@material-ui/core/Paper';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import yellow from '@material-ui/core/colors/yellow';


/* Chart code */
// Themes begin
am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);
// Themes end

class TimelineChart extends Component {
  primaryColor = red[500]
  secondaryColor = yellow[100]
  background = '#303030'

  getLineData() {
    return _.chain(this.props.mapData)
      .pluck('data')
      .flatten()
      .groupBy('date')
      .map((items, date) => ({
        date: new Date(+date),
        value: items.reduce((memo, item) => memo + item[this.props.status], 0)
      }))
      .value()
  }

  getColumnData() {
    return this.props.dates.map(date => ({
      date: new Date(+date),
      value: _.chain(this.props.mapData)
        .map(({ country, countryId, data }) => {
          let pointA = data.find(item => item.date === date)
          let pointB = data.find(item => item.date === date - 86400000)

          return pointA[this.props.status] - (pointB ? pointB[this.props.status] : 0)
        })
        .reduce((memo, increment) => memo + increment, 0)
        .value()
    }))
  }

  getCountryData() {
    let country = this.props.country

    return _.chain(this.props.mapData)
      .where({ countryId: country })
      .pluck('data')
      .flatten()
      .groupBy('date')
      .map((items, date) => ({
        country,
        date: new Date(+date),
        countryValue: items.reduce((memo, item) => memo + item[this.props.status], 0)
      }))
      .value()
  }

  applyData(index, data) {
    if (!_.isEqual(this.chart.series.values[index].data, data)) {
      this.chart.series.values[index].data = data
    }
  }

  getDateLine() {
    let { date, dates } = this.props
    let index = dates.indexOf(date)

    return `${(index + 0.5) * 100 / dates.length}%`
  }

  componentDidMount() {
    // Create chart instance
    let chart = am4core.create("timeline-chart", am4charts.XYChart);

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#a";

    // Create worldwide line series
    let lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.dataFields.valueY = "value";
    lineSeries.dataFields.dateX = "date";
    lineSeries.tooltipText = "Worldwide: {value}"
    lineSeries.fill = am4core.color(this.primaryColor);
    lineSeries.stroke = am4core.color(this.primaryColor);
    lineSeries.strokeWidth = 5;

    // let bullet = lineSeries.bullets.push(new am4charts.Bullet());
    // bullet.fill = am4core.color(this.primaryColor); // tooltips grab fill from parent by default

    // let circle = bullet.createChild(am4core.Circle);
    // circle.radius = 4;

    lineSeries.data = this.getLineData()

    // Create increment column Series
    let columnSeries = chart.series.push(new am4charts.ColumnSeries());
    columnSeries.dataFields.valueY = "value";
    columnSeries.dataFields.dateX = "date";
    columnSeries.tooltipText = "Worldwide Increment: {value}"
    columnSeries.fill = am4core.color(green[500]);
    columnSeries.stroke = am4core.color(green[500]);

    columnSeries.data = this.getColumnData()

    // Create country line series
    let countryAxis = chart.yAxes.push(new am4charts.ValueAxis());
    countryAxis.renderer.opposite = true;
    countryAxis.cursorTooltipEnabled = false;

    // Use 000s suffix
    countryAxis.numberFormatter = new am4core.NumberFormatter();
    countryAxis.numberFormatter.numberFormat = "#a";

    var countrySeries = chart.series.push(new am4charts.LineSeries())
    countrySeries.dataFields.valueY = "countryValue";
    countrySeries.dataFields.dateX = "date";
    countrySeries.yAxis = countryAxis;

    countrySeries.tooltipText = "{country}: {countryValue}"
    countrySeries.fill = am4core.color(this.secondaryColor);
    countrySeries.stroke = am4core.color(this.secondaryColor);
    countrySeries.strokeWidth = 5;

    // let countryBullet = countrySeries.bullets.push(new am4charts.Bullet());
    // countryBullet.fill = am4core.color(this.secondaryColor); // tooltips grab fill from parent by default

    // let countryCircle = countryBullet.createChild(am4core.Circle);
    // countryCircle.radius = 4;

    countrySeries.data = this.getCountryData()

    // Mouse Crosshair
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    // Add Date Line
    this.middleLine = chart.plotContainer.createChild(am4core.Line);
    this.middleLine.strokeOpacity = 0.25;
    this.middleLine.stroke = am4core.color("#fff");
    this.middleLine.strokeWidth = 3;
    this.middleLine.strokeDasharray = "5";
    this.middleLine.x = this.getDateLine()
    this.middleLine.zIndex = 1;
    this.middleLine.adapter.add("y2", function (y2, target) {
      return target.parent.pixelHeight;
    })

    this.chart = chart;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    if (this.chart) {
      this.applyData(0, this.getLineData())
      this.applyData(1, this.getColumnData())
      this.applyData(2, this.getCountryData())
    }

    if (this.middleLine) {
      this.middleLine.x = this.getDateLine()
    }

    return (
      <Paper style={{ height: '100%', padding: 8 }}>
        <div id="timeline-chart" style={{ width: "100%", height: '100%', minHeight: 360 }} />
      </Paper>
    );
  }
}

export default TimelineChart

