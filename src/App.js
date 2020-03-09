import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
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
                COVID-19
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

          <Hidden xsDown>
            <div className={classes.top}>
              <Statistics
                mapData={mapData}
                date={currentDate}
              />
            </div>
          </Hidden>

          <div className={classes.main}>

            <WorldMap
              mapData={data}
              date={currentDate}
              status={status}
              country={country}
              onClick={setCountry}
              max={max}
            />

            <Timeline
              min={dates[0]}
              max={dates[dates.length - 1]}
              step={dates[1] - dates[0]}
              value={currentDate}
              handleChange={setDate}
            />

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
