import _ from 'underscore'
import getStateIds from './get-state-ids.json'

// Transforming from JHU data to GeoJSON data
const states = {
  "Xinjiang": "Xinjiang Uygur",
  "Tibet": "Xizang (Tibet)",
  "Inner Mongolia": "Nei Mongol",
  "Ningxia": "Ningxia Hui",
  "Guangxi": "Guangxi Zhuang"
}

// Transforming from JHU data to GeoJSON data
const countries = {
  "Mainland China": "China",
  "Macau": "Macao",
  "US": "United States",
  "South Korea": "Korea, Republic of",
  "Taiwan": "China",
  "Vietnam": "Viet Nam",
  "UK": "United Kingdom",
  "Russia": "Russian Federation",
  "Iran": "Iran, Islamic Republic of",
  "Iran (Islamic Republic of)": "Iran, Islamic Republic of",
  "Republic of Korea": "Korea, Republic of",
  "Hong Kong SAR": "Hong Kong",
  "Macao SAR": "Macao",
  "Republic of Moldova": "Moldova, Republic of",
  "Moldova": "Moldova, Republic of",
  "Brunei": "Brunei Darussalam",
  "Vatican City": "Holy See (Vatican City State)",
  "Holy See": "Holy See (Vatican City State)",
  "St. Martin": "Saint Martin (French Part)",
  "Saint Martin": "Saint Martin (French Part)",
  "St Martin": "Saint Martin (French Part)",
  "Palestine": "Palestinian, State of",
  "occupied Palestinian territory": "Palestinian, State of",
  "Taipei and environs": "Taiwan, Province of China",
  "Taiwan*": "Taiwan, Province of China",
  "Korea, South": "Korea, Republic of",
  "Cruise Ship": "Others",
  "Czechia": "Czech Republic",
  "Bolivia": "Bolivia, Plurinational State of",
  "Congo (Kinshasa)": "Congo, the Democratic Republic of the",
  "Congo (Brazzaville)": "Congo",
  "Eswatini": "Swaziland",
  "Venezuela": "Venezuela, Bolivarian Republic of",
  "The Bahamas": "Bahamas",
  "Tanzania": "Tanzania, United Republic of",
  "Republic of the Congo": "Congo",
}

const stateToCountry = [
  'Faroe Islands',
  'St Martin',
  'Channel Islands',
  'Saint Barthelemy',
  'Gibraltar',
  'French Polynesia',
  'French Guiana',
  'Mayotte',
]

let fixStateName = ({ state, country }) => {
  // Change specific places owned by countries into countries
  if (stateToCountry.includes(state)) {
    country = `${state}`
    state = ''
  }

  country = countries[country] || country
  state = states[state] || state

  // Change ship to location
  if (state === 'Grand Princess') {
    country = 'Others'
  }

  // Change ship to location
  if (/Diamond Princess/.test(state)) {
    country = 'Others'
    state = 'Diamond Princess'
  }

  // Canadian state id
  if (country === 'Canada') {
    let id = state.replace(/^.*,/g, '').trim()
    let ids = _.invert(getStateIds[country])

    state = ids['CA-' + id] || id
  }

  // US state id
  if (country === 'United States') {
    let id = state.replace(/^.*,/g, '').replace(/\./g, '').trim()
    let ids = _.invert(getStateIds[country])

    state = ids['US-' + id] || id
  }

  return { state, country }
}

export default fixStateName