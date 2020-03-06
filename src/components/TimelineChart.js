import React, { Component } from 'react';
import _ from 'underscore'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';


/* Chart code */
// Themes begin
am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);
// Themes end

// Themes begin
am4core.useTheme(am4themes_animated);

class TimelineChart extends Component {
  color = red[500]
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

  componentDidMount() {
    // Create chart instance
    let chart = am4core.create("timeline-chart", am4charts.XYChart);

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    // dateAxis.renderer.minGridDistance = 60;

    chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    let lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.dataFields.valueY = "value";
    lineSeries.dataFields.dateX = "date";
    lineSeries.tooltipText = "{value}"
    lineSeries.stroke = am4core.color(this.color);
    lineSeries.strokeWidth = 3;

    let bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.fill = am4core.color(this.color); // tooltips grab fill from parent by default
    // bullet.tooltipText = "[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]"

    let circle = bullet.createChild(am4core.Circle);
    circle.radius = 4;
    // circle.fill = am4core.color(this.background);
    // circle.strokeWidth = 3;

    lineSeries.data = this.getLineData()

    // Create Column Series
    let columnSeries = chart.series.push(new am4charts.ColumnSeries());
    // columnSeries.name = "Income";
    columnSeries.dataFields.valueY = "value";
    columnSeries.dataFields.dateX = "date";
    columnSeries.fill = am4core.color(green[500]);
    columnSeries.stroke = am4core.color(green[500]);

    // columnSeries.columns.template.tooltipText = "[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]"
    // columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
    // columnSeries.columns.template.propertyFields.stroke = "stroke";
    // columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
    // columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";
    // columnSeries.tooltip.label.textAlign = "middle";

    columnSeries.data = this.getColumnData()

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.snapToSeries = lineSeries;
    chart.cursor.xAxis = dateAxis;

    //chart.scrollbarY = new am4core.Scrollbar();
    // chart.scrollbarX = new am4core.Scrollbar();


    this.chart = chart;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    if (this.chart) {
      this.chart.series.values[0].data = this.getLineData()
      this.chart.series.values[1].data = this.getColumnData()
    }

    return (
      <div id="timeline-chart" style={{ width: "100%", height: '100%', minHeight: 360 }} />
    );
  }
}

export default TimelineChart

