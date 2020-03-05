import countries from './countries.json'

let allCodes = Object.keys(countries)
let allCountries = Object.values(countries).map(({ country }) => country)

const getCountryId = country => {
  let index = allCountries.indexOf(country)

  return allCodes[index]
}

export default getCountryId