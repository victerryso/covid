import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import IconButton from '@material-ui/core/IconButton'
import Close from '@material-ui/icons/Close'
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import grey from '@material-ui/core/colors/grey';
import _ from 'underscore'
import countries from '../data/countries.json'
import states from '../data/get-state-ids.json'
import countriesWithStates from '../data/countries-with-states.json'

// Themes begin
am4core.useTheme(am4themes_animated);

class WorldMap extends Component {
  color = red[500]
  nullColor = grey[200]
  minColor = yellow[100]
  maxColor = red[500]

  getValue(params) {
    return _.chain(this.props.mapData)
      .where(params)
      .reduce((memo, { value }) => memo + value, 0)
      .value()
  }

  getCountriesData() {
    return _.map(countries, ({ country, map, id }) => {
      let value = this.getValue({ country })

      return {
        id,
        country,
        map,
        value: value ? Math.log(value) : undefined,
        tooltip: value ? `${country}: ${value.toLocaleString()}` : country,
      }
    })
  }

  hasStateData(country) {
    return countriesWithStates.includes(country)
  }

  getStatesData(country, map) {
    if (!this.hasStateData(country)) {
      return
    }

    return _.map(states[country], (id, state) => {
      let value = this.getValue({ state, country })

      return {
        id,
        value: value ? Math.log(value) : undefined,
        tooltip: value ? `${state}: ${value.toLocaleString()}` : state,
      }
    })
  }

  getOtherData() {
    return _.chain(this.props.mapData)
      .where({ country: 'Others', })
      .map(({ state, latitude, longitude, value }) => ({
        longitude: +longitude,
        latitude: +latitude,
        color: this.color,
        tooltip: `${state}: ${value}`
      }))
      .value()
  }

  selectCountry(country) {
    // Only a few countries have state data
    if (!this.hasStateData(country)) {
      // return
      return this.resetMap()
    }

    let chart = this.chart
    let series = chart.series.values[1]

    let polygon = chart.series.values[0].mapPolygons.values.find(value => {
      return value.dataItem && value.dataItem.dataContext && value.dataItem.dataContext.name === country
    })

    let map = polygon.dataItem.dataContext.map

    chart.zoomToMapObject(polygon)

    series.geodataSource.url = "https://www.amcharts.com/lib/4/geodata/json/" + map + ".json";
    series.geodataSource.load();
    series.data = this.getStatesData(country, map)
  }

  // Show world map and hide country map
  resetMap() {
    let chart = this.chart

    chart.series.values[0].show()
    chart.series.values[1].hide()
    chart.goHome()
  }

  changeMaxValue() {
    let series = this.chart.series.values[0]
    let rules = series.heatRules.values[0]

    rules.maxValue = Math.log(this.props.max)
  }

  componentDidMount() {
    let chart = am4core.create("chartdiv", am4maps.MapChart);

    chart.projection = new am4maps.projections.Miller();

    // Create map polygon series for world map
    let worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
    worldSeries.useGeodata = true;
    worldSeries.geodata = am4geodata_worldLow;
    worldSeries.exclude = ["AQ"]; // Remove Antartica
    worldSeries.heatRules.push({
      property: "fill",
      target: worldSeries.mapPolygons.template,
      minValue: 0,
      maxValue: Math.log(this.props.max),
      min: am4core.color(this.minColor),
      max: am4core.color(this.maxColor),
    });

    worldSeries.data = this.getCountriesData()

    let worldPolygon = worldSeries.mapPolygons.template;
    worldPolygon.nonScalingStroke = true;
    worldPolygon.fill = am4core.color(this.nullColor);
    worldPolygon.propertyFields.fill = "color";
    worldPolygon.tooltipText = "{tooltip}";
    worldPolygon.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    // let hs = worldPolygon.states.create("hover");
    // hs.properties.fill = chart.colors.getIndex(9);

    // Create country specific series (but hide it for now)
    let countrySeries = chart.series.push(new am4maps.MapPolygonSeries());
    countrySeries.useGeodata = true;
    countrySeries.hide();
    countrySeries.geodataSource.events.on("done", function(ev) {
      worldSeries.hide();
      countrySeries.show();
    });
    countrySeries.heatRules.push({
      property: "fill",
      target: countrySeries.mapPolygons.template,
      minValue: 0,
      min: am4core.color(this.minColor),
      max: am4core.color(this.maxColor),
    });

    let countryPolygon = countrySeries.mapPolygons.template;
    countryPolygon.tooltipText = "{name}";
    countryPolygon.nonScalingStroke = true;
    countryPolygon.fill = am4core.color(this.nullColor);
    countryPolygon.tooltipText = "{tooltip}";

    // let hs = countryPolygon.states.create("hover");
    // hs.properties.fill = chart.colors.getIndex(9);

    // Set up click events
    worldPolygon.events.on("hit", ev => {
      let { country, map } = ev.target.dataItem.dataContext

      if (map) {
        this.selectCountry(country)
      }

      this.props.handleClick({ country })
    });

    countryPolygon.events.on("hit", ev => {
      let state = ev.target.dataItem.dataContext.name

      this.props.handleClick({ state })
    });

    let imageSeries = chart.series.push(new am4maps.MapImageSeries());
    imageSeries.mapImages.template.propertyFields.longitude = "longitude";
    imageSeries.mapImages.template.propertyFields.latitude = "latitude";
    imageSeries.mapImages.template.tooltipText = "{tooltip}";
    imageSeries.mapImages.template.propertyFields.url = "url";

    let circle = imageSeries.mapImages.template.createChild(am4core.Circle);
    circle.radius = 3;
    circle.propertyFields.fill = "color";

    let circle2 = imageSeries.mapImages.template.createChild(am4core.Circle);
    circle2.radius = 3;
    circle2.propertyFields.fill = "color";

    let animateBullet = circle => {
      let animation = circle.animate([{
        property: "scale",
        from: 1,
        to: 5
      }, {
        property: "opacity",
        from: 1,
        to: 0
      }], 1000, am4core.ease.circleOut);

      animation.events.on("animationended", event => animateBullet(event.target.object))
    }

    circle2.events.on("inited", event => animateBullet(event.target))

    imageSeries.data = this.getOtherData()

    // Zoom control
    chart.zoomControl = new am4maps.ZoomControl();
    chart.zoomControl.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    let homeButton = new am4core.Button();

    homeButton.events.on("hit", () => {
      this.resetMap()
      this.props.handleClick()
    });

    homeButton.icon = new am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.fill = '#bbb'
    homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);
    homeButton.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    this.chart = chart;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    let country = this.props.country

    if (this.chart) {
      // If country is selected, zoom into a country else reset the map
      if (country) {
        this.selectCountry(country)
      } else {
        this.resetMap()
      }

      let values = [
        this.getCountriesData(),
        country && this.getStatesData(country),
        this.getOtherData(),
      ]

      values.forEach((value, index) => {
        if (value) {
          this.chart.series.values[index].data = value
        }
      })

      this.changeMaxValue()
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '50%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div id="chartdiv" style={{ width: "100%", height: '100%' }}></div>
        </div>

        {country ? <IconButton
          onClick={() => this.props.handleClick()}
          style={{ position: 'absolute', top: 0, right: 0 }}
        >
          <Close fontSize="large" />
        </IconButton> : ''}
      </div>
    );
  }
}

export default WorldMap
