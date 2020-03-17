import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import red from '@material-ui/core/colors/red';
import 'typeface-roboto';

import getCovidData from './lib/get-covid-data'
import Timeline from './components/Timeline';
import WorldMap from './components/WorldMap'
import DateCounter from './components/DateCounter'
import TotalCounter from './components/TotalCounter'
import DateSelect from './components/DateSelect'
import StatusSelect from './components/StatusSelect'
import DailyTable from './components/DailyTable'
import TimelineChart from './components/TimelineChart'
import Statistics from './components/Statistics'
import CountryChips from './components/CountryChips'
import flags from './data/country-flags.json'

const useStyles = makeStyles(theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(2, 0)
  },
  paper: {
    width: '100%',
  },
  alignRight: {
    textAlign: 'right'
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    marginLeft: theme.spacing(1)
  },
  marginRight: {
    marginRight: theme.spacing(3),
  }
}));

const theme = createMuiTheme({
  palette: {
    primary: red,
    type: 'dark',
  },
});

function App() {
  const classes = useStyles();

  const [mapData, setMapData] = useState();
  const [date, setDate] = useState();
  const [status, setStatus] = useState('confirmed');
  const [country, setCountry] = useState();

  useEffect(() => {
    getCovidData().then(setMapData)
  }, [])

  if (mapData) {
    let dates = mapData[0].data.map(({ date }) => +date).sort()
    let currentDate = date || dates[dates.length - 1]

    let data = mapData.map(({ data, ...item }) => ({
      ...item,
      value: data.find(({ date }) => date === currentDate)[status]
    }))

    let max = mapData.map(({ data }) => {
      return data.find(({ date }) => date === dates[dates.length - 1])[status]
    }).reduce((memo, value) => memo + value, 0)

    let getCountryName = country => {
      let item = mapData.find(({ countryId }) => country === countryId)

      return item ? item.country : undefined
    }

    let getFlag = country => {
      return flags[country] ? flags[country].emoji : undefined
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Container maxWidth='xl'>

          <div className={classes.top}>

            <div>
              <DateCounter
                mapData={mapData}
                date={currentDate}
              />

              <DateSelect
                date={currentDate}
                dates={dates}
                handleChange={setDate}
              />
            </div>

            <Hidden xsDown>
              <Typography variant='h3'>
                {country ? (
                  <div className={classes.flex}>
                    <span className={classes.marginRight}>{getFlag(country)}</span>
                    <span>{getCountryName(country)}</span>
                    <IconButton
                      className={classes.button}
                      onClick={() => setCountry(null)}
                    >
                      <CloseIcon fontSize='large' />
                    </IconButton>
                  </div>
                ) : 'COVID-19'}
              </Typography>
            </Hidden>

            <div className={classes.alignRight}>
              <TotalCounter
                mapData={data}
                date={currentDate}
                status={status}
                country={country}
              />

              <StatusSelect
                status={status}
                handleChange={setStatus}
              />
            </div>

          </div>

          <div className={classes.top}>
            <Statistics
              mapData={mapData}
              date={currentDate}
              country={country}
              status={status}
            />
          </div>

          <div className={classes.main}>

            <WorldMap
              mapData={data}
              date={currentDate}
              status={status}
              country={country}
              handleClick={setCountry}
              max={max}
            />

            <CountryChips
              country={country}
              handleClick={setCountry}
            />

            <Timeline
              min={dates[0]}
              max={dates[dates.length - 1]}
              step={dates[1] - dates[0]}
              value={currentDate}
              handleChange={setDate}
            />
{
            <Grid container spacing={1}>

              <Grid item sm className={classes.paper}>
                <DailyTable
                  mapData={mapData}
                  date={currentDate}
                  status={status}
                  country={country}
                  handleClick={setCountry}
                />
              </Grid>

              <Grid item sm className={classes.paper}>
                <TimelineChart
                  mapData={mapData}
                  date={currentDate}
                  status={status}
                  country={country}
                  dates={dates}
                />
              </Grid>

            </Grid>
}
          </div>

        </Container>

      </ThemeProvider>
    );
  }

  return (
    <div className="App" />
  );
}

export default App;
