import Papa from 'papaparse'
import _ from 'underscore'
import moment from 'moment'

import fixStateNames from '../data/fix-state-names'
import getStateId from '../data/get-state-ids.json'
import countries from '../data/countries.json'
import flags from '../data/country-flags.json'
import urls from '../data/data-sources.json'

const getCountryId = name => {
  let item = countries.find(({ country }) => name === country)

  return item ? item.id : undefined
}

// Transform data from source to geoJSON styling
const transformItem = ({ title, item, exclusions = [] }) => {
  let { state, country } = fixStateNames({
    state: item['Province/State'] || item['Province_State'],
    country: item['Country/Region'] || item['Country_Region'],
  })

  // Created specifically since US is added twice
  if (exclusions.includes(country)) {
    return
  }

  // Grab date keys
  let dates = Object.keys(item).filter(key => /^(\d|\/)*$/.test(key))

  let stateId = state && getStateId[country] && getStateId[country][state]
  let countryId = getCountryId(country)
  let flag = flags[countryId]

  return {
    state,
    country,
    stateId,
    countryId,
    trueCountry: item['Country/Region'] || item['Country_Region'],
    flag,
    latitude: item['Lat'],
    longitude: item['Long'],
    data: dates.map(date => ({
      title,
      value: +item[date],
      date: +moment.utc(date, 'M/DD/YYYY'),
    }))
  }
}

const getCovidData = async () => {
  let promises = urls.map(({ title, url, exclusions }) => {
    return new Promise(resolve => {
      Papa.parse(url, {
        header: true,
        download: true,
        complete: ({ data }) => resolve({ title, data, exclusions })
      })
    })
  })

  let results = await Promise.all(promises)

  return _.chain(results)
    .map(({ title, data, exclusions }) => data.map(item => transformItem({ title, item, exclusions })))
    .flatten()
    .compact()
    .groupBy(({ data, latitude, longitude, ...params }) => JSON.stringify(params))
    .map((items, location) => ({
      ...JSON.parse(location),
      latitude: items[0].latitude,
      longitude: items[0].longitude,
      data: _.chain(items)
        .pluck('data')
        .flatten()
        .groupBy('date')
        .map((items, date) => ({
          date: +date,
          ...items.reduce((memo, { title, value }) => ({
            ...memo,
            [title]: value + (memo[title] || 0),
          }), {})
        }))
        .map(item => ({
          ...item,
          existing: item.confirmed - item.deaths - (item.recovered || 0),
        }))
        .value()
    }))
    .filter(({ country }) => country)
    .value()
}

export default getCovidData
