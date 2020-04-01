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
const transformItem = ({ title, item }) => {
  let keys = ['Province/State', 'Country/Region', 'Lat', 'Long']
  let dates = Object.keys(item).filter(key => !keys.includes(key))

  let { state, country } = fixStateNames({
    state: item['Province/State'],
    country: item['Country/Region']
  })


  let stateId = state && getStateId[country] && getStateId[country][state]
  let countryId = getCountryId(country)
  let flag = flags[countryId]

  return {
    state,
    country,
    stateId,
    countryId,
    trueCountry: item['Country/Region'],
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
  let promises = urls.map(({ title, url }) => {
    return new Promise(resolve => {
      Papa.parse(url, {
        header: true,
        download: true,
        complete: ({ data }) => resolve({ title, data })
      })
    })
  })

  let results = await Promise.all(promises)

  return _.chain(results)
    .map(({ title, data }) => data.map(item => transformItem({ title, item })))
    .flatten()
    .groupBy(({ data, ...params }) => JSON.stringify(params))
    .map((items, location) => ({
      ...JSON.parse(location),
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
          existing: item.confirmed - item.deaths,
        }))
        .value()
    }))
    .filter(({ country }) => country)
    .value()
}

export default getCovidData
