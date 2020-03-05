import _ from 'underscore'
import getStateIds from './get-state-ids.json'

const states = {
  "Xinjiang": "Xinjiang Uygur",
  "Tibet": "Xizang (Tibet)",
  "Inner Mongolia": "Nei Mongol",
  "Ningxia": "Ningxia Hui",
  "Guangxi": "Guangxi Zhuang"
}


let fixStateName = ({ state, country }) => {
  if (country === 'Mainland China') {
    return states[state]
  }

  if (country === 'Canada') {
    let id = state.replace(/^.*,/g, '').trim()
    let ids = _.invert(getStateIds[country])

    return ids['CA-' + id]
  }

  if (country === 'US') {
    let id = state.replace(/^.*,/g, '').trim()
    let ids = _.invert(getStateIds['United States'])

    return ids['US-' + id]
  }
}

export default fixStateName