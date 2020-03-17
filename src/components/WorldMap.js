import React from 'react'
import _ from 'underscore'
import HighMaps from "highcharts/highmaps";
import HighchartsReact from 'highcharts-react-official'
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';

import auMap from '@highcharts/map-collection/countries/au/au-all.geo.json'
import caMap from '@highcharts/map-collection/countries/ca/ca-all.geo.json'
import cnMap from '@highcharts/map-collection/countries/cn/cn-all.geo.json'
import usMap from '@highcharts/map-collection/countries/us/us-all.geo.json'
import worldMap from '@highcharts/map-collection/custom/world.geo.json'

const minColor = yellow[100]
const maxColor = red[500]

const maps = {
  AU: auMap,
  CA: caMap,
  CN: cnMap,
  US: usMap,
}

const hasMap = country => {
  return Object.keys(maps).includes(country)
}

HighMaps.setOptions({
  lang: {
    thousandsSep: ','
  }
})

const HighchartsWorldMap = function (props) {
  const config = {
    chart: {
      map: maps[props.country] || worldMap,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    legend: {
      enabled: false
    },
    tooltip: {
      headerFormat: '',
      pointFormat: '{point.name}: <b>{point.value}</b>'
    },
    colorAxis: {
      min: 1,
      type: 'logarithmic',
      allowNegativeLog: true,
      minColor,
      maxColor,
    },
    mapNavigation: {
      enabled: true,
    },
    series: [{
      name: props.status,
      fill: '#eee',
      borderColor: '#303030',
      borderWidth: 1,
      data: _.chain(props.mapData)
        .groupBy(hasMap(props.country) ? 'stateId' : 'countryId')
        .map((items, countryId) => ({
          countryId,
          'hc-key': countryId.toLowerCase().slice(0, 5),
          value: items.reduce((memo, { value }) => memo + value, 0),
        }))
        .filter(({ value }) => value)
        .value(),

      point: {
        events: {
          click: function () {
            if (hasMap(this.countryId)) {
              props.handleClick(this.countryId)
            }
          }
        }
      }
    }]
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '50%' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <HighchartsReact
          highcharts={HighMaps}
          options={config}
          constructorType='mapChart'
          containerProps={{ style: { height: '100%' } }}
        />
      </div>
    </div>
  )
}

export default HighchartsWorldMap
