import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import red from '@material-ui/core/colors/red';
import 'typeface-roboto';

import getCovidData from './lib/get-covid-data'
import Timeline from './components/Timeline';
import WorldMap from './components/WorldMap'
import DateCounter from './components/DateCounter'
import TotalCounter from './components/TotalCounter'
import StatusSelect from './components/StatusSelect'
import DailyUpdate from './components/DailyUpdate'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'relative',
  },
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

  const handleChange = (event, value) => setDate(value)

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

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Container maxWidth='xl' className={classes.container}>

          <WorldMap
            mapData={data}
            date={currentDate}
            status={status}
            country={country}
            onClick={setCountry}
          />

          <Timeline
            min={dates[0]}
            max={dates[dates.length - 1]}
            step={dates[1] - dates[0]}
            value={currentDate}
            onChange={handleChange}
          />

          <StatusSelect
            status={status}
            handleChange={setStatus}
          />

          {/*
          <DateCounter
            mapData={mapData}
            date={currentDate}
          />
          */}

          <TotalCounter
            mapData={data}
            date={currentDate}
            status={status}
            country={country}
          />

          <DailyUpdate
            mapData={mapData}
            date={currentDate}
            status={status}
            country={country}
          />

        </Container>

      </ThemeProvider>
    );
  }

  return (
    <div className="App" />
  );
}

export default App;
