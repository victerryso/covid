import React, { Component } from 'react';
import _ from 'underscore'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import yellow from '@material-ui/core/colors/yellow';

/* Chart code */
// Themes begin
am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);
// Themes end

const style = {
  width: "100%",
  height: '100%',
  minHeight: 360,
  marginBottom: 8,
}

class TimelineChart extends Component {
  primaryColor = red[500]
  secondaryColor = yellow[100]
  background = '#303030'

  getLineData() {
    let { country, state, mapData, status } = this.props

    if (this.chart) {
      let series = this.chart.series.values[0]
      let name = state || country || 'Worldwide'

      series.tooltipText = `${name}: {value}`
    }

    return _.chain(mapData)
      .filter(item => {
        if (state)   return _.isMatch(item, { country, state })
        if (country) return item.country === country
                     return true
      })
      .pluck('data')
      .flatten()
      .groupBy('date')
      .map((items, date) => ({
        date: new Date(+date),
        value: items.reduce((memo, item) => memo + (item[status] || 0), 0)
      }))
      .value()
  }

  getColumnData() {
    let { dates, mapData, status, country, state } = this.props

    if (this.chart) {
      let series = this.chart.series.values[1]
      let name = state || country || 'Worldwide'

      // series.yAxis = country ? this.countryAxis : this.valueAxis
      series.tooltipText = `${name} Increment: {value}`
    }

    return dates.map(date => ({
      date: new Date(+date),
      value: _.chain(mapData)
        .filter(item => {
          if (state)   return item.country === country && item.state === state
          if (country) return item.country === country
                       return true
        })
        .map(({ country, countryId, data }) => {
          let pointA = data.find(item => item.date === date)
          let pointB = data.find(item => item.date === date - 86400000)

          return pointA[status] - (pointB ? pointB[status] : 0)
        })
        .reduce((memo, increment) => memo + (increment || 0), 0)
        .value()
    }))
  }

  getCountryData() {
    let { country, state, mapData, status } = this.props
    let params = state ? { country, state } : { country }

    return _.chain(mapData)
      .where(params)
      .filter()
      .pluck('data')
      .flatten()
      .groupBy('date')
      .map((items, date) => ({
        name: state || country,
        date: new Date(+date),
        value: items.reduce((memo, item) => memo + (item[status] || 0), 0)
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
    valueAxis.min = 0
    valueAxis.renderer.opposite = true;

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
    // let countryAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // countryAxis.renderer.opposite = true;
    // countryAxis.cursorTooltipEnabled = false;
    // countryAxis.min = 0

    // // Use 000s suffix
    // countryAxis.numberFormatter = new am4core.NumberFormatter();
    // countryAxis.numberFormatter.numberFormat = "#a";

    // var countrySeries = chart.series.push(new am4charts.LineSeries())
    // countrySeries.dataFields.valueY = "value";
    // countrySeries.dataFields.dateX = "date";
    // countrySeries.yAxis = countryAxis;

    // countrySeries.tooltipText = "{name}: {value}"
    // countrySeries.fill = am4core.color(this.secondaryColor);
    // countrySeries.stroke = am4core.color(this.secondaryColor);
    // countrySeries.strokeWidth = 5;

    // let countryBullet = countrySeries.bullets.push(new am4charts.Bullet());
    // countryBullet.fill = am4core.color(this.secondaryColor); // tooltips grab fill from parent by default

    // let countryCircle = countryBullet.createChild(am4core.Circle);
    // countryCircle.radius = 4;

    // countrySeries.data = this.getCountryData()

    // Mouse Crosshair
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    // Add Date Line
    this.middleLine = chart.plotContainer.createChild(am4core.Line);
    // this.middleLine.strokeOpacity = 0.25;
    this.middleLine.stroke = am4core.color(this.secondaryColor);
    this.middleLine.strokeWidth = 2;
    // this.middleLine.strokeDasharray = "5";
    this.middleLine.x = this.getDateLine()
    this.middleLine.zIndex = 1;
    this.middleLine.adapter.add("y2", function (y2, target) {
      return target.parent.pixelHeight;
    })

    this.chart = chart;
    // this.countryAxis = countryAxis
    this.valueAxis = valueAxis
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
      // this.applyData(2, this.getCountryData())
    }

    if (this.middleLine) {
      this.middleLine.x = this.getDateLine()
    }

    return (
      <div id="timeline-chart" style={style} />
    );
  }
}

export default TimelineChart

