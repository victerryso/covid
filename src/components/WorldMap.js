import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import grey from '@material-ui/core/colors/grey';
import _ from 'underscore'
import countries from '../data/countries.json'
import states from '../data/get-state-ids.json'

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
    return _.map(countries, ({ country, maps }, id) => {
      let value = this.getValue({ country })

      return {
        id,
        country,
        map: maps[0],
        value: value ? Math.log(value) + 1 : undefined,
        tooltip: value ? `${country}: ${value}` : country,
      }
    })
  }

  hasStateData(country) {
    return Object.keys(states).includes(country)
  }

  getStatesData(country, map) {
    return _.map(states[country], (id, state) => {
      let value = this.getValue({ state, country })

      return {
        id,
        value: value ? Math.log(value) + 1 : undefined,
        tooltip: value ? `${state}: ${value}` : state,
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

    let worldPolygon = worldSeries.mapPolygons.template;
    worldPolygon.nonScalingStroke = true;
    worldPolygon.fill = am4core.color(this.nullColor);
    worldPolygon.propertyFields.fill = "color";
    worldPolygon.tooltipText = "{tooltip}";

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
      let { name, country, map } = ev.target.dataItem.dataContext
      this.props.onClick(country)

      if (map && this.hasStateData(name)) {
        ev.target.series.chart.zoomToMapObject(ev.target);
        // ev.target.isHover = false;
        countrySeries.geodataSource.url = "https://www.amcharts.com/lib/4/geodata/json/" + map + ".json";
        countrySeries.geodataSource.load();

        let name = ev.target.dataItem.dataContext.name

        countrySeries.data = this.getStatesData(name, map)
      }
    });

    // Set up data for countries
    worldSeries.data = this.getCountriesData()

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

    let homeButton = new am4core.Button();
    homeButton.events.on("hit", () => {
      worldSeries.show();
      countrySeries.hide();
      chart.goHome();

      this.props.onClick()
    });

    homeButton.icon = new am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.fill = '#bbb'
    homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);

    this.chart = chart;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    if (this.chart) {
      let values = [
        this.getCountriesData(),
        this.props.country && this.getStatesData(this.props.country),
        this.getOtherData(),
      ]

      values.forEach((value, index) => {
        if (value) {
          this.chart.series.values[index].data = value
        }
      })
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '50%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div id="chartdiv" style={{ width: "100%", height: '100%' }}></div>
        </div>
      </div>
    );
  }
}

export default WorldMap
