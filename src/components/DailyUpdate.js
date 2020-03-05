import React from 'react';
import _ from 'underscore';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import green from '@material-ui/core/colors/green';

import flags from '../data/country-flags.json'

const useStyles = makeStyles(theme => ({
  container: {
    // position: 'absolute',
    bottom: theme.spacing(6),
    left: 0,
    margin: theme.spacing(2)
  },

  items: {
    maxHeight: 360,
    overflow: 'scroll',
  },

  flex: {
    display: 'flex',
    alignItems: 'center',
  },

  grow: {
    flexGrow: 1,
  },

  count: {
    width: 60,
    textAlign: 'right',
  },

  increment: {
    width: 60,
    textAlign: 'right',
    color: green[500]
  },
}));

const DailyUpdate = function (props) {
  const classes = useStyles()

  const countries = _.chain(props.mapData)
    .map(({ country, countryId, data }) => {
      let pointA = data.find(({ date }) => date === props.date)
      let pointB = data.find(({ date }) => date === props.date - 86400000)

      return {
        country,
        flag: flags[countryId] && flags[countryId].emoji,
        count: pointA[props.status],
        increment: pointA[props.status] - (pointB ? pointB[props.status] : 0),
      }
    })
    .groupBy(({ country, flag }) => JSON.stringify({ country, flag }))
    .map((items, params) => ({
      ...JSON.parse(params),
      count: items.reduce((memo, { count }) => memo + count, 0),
      increment: items.reduce((memo, { increment }) => memo + increment, 0),
    }))
    .sortBy('country')
    .sortBy(({ count }) => -count)
    .sortBy(({ increment }) => -increment)
    .value()

  const daily = countries.reduce((memo, { increment }) => memo + increment, 0)

  const total = props.mapData
    .map(({ data }) => data.find(({ date }) => date === props.date))
    .map(data => data[props.status])
    .reduce((memo, value) => memo + value, 0)

  const day = props.mapData[0].data.filter(({ date }) => date <= props.date).length

  const subheader = (
    <ListSubheader className={classes.flex}>
      <ListItemIcon><span>Day {day}</span></ListItemIcon>

      <div className={classes.grow}>
        {moment.utc(props.date).format('MMM Do')}
      </div>

      <div className={classes.flex}>
        <div className={classes.increment}>+{daily.toLocaleString()}</div>
        <div className={classes.count}>{total.toLocaleString()}</div>
      </div>
    </ListSubheader>
  )

  return (
    <div className={classes.container}>
      <Paper className={classes.root}>
        <List dense subheader={subheader}>
          <div className={classes.items}>
            {countries.map(({ flag, country, increment, count }, index) => (
              <ListItem key={index}>
                <ListItemIcon><span>{flag}</span></ListItemIcon>
                <ListItemText
                  primary={country}
                />
                <ListItemSecondaryAction className={classes.flex}>
                  <div className={classes.increment}>+{increment.toLocaleString()}</div>
                  <div className={classes.count}>{count.toLocaleString()}</div>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </div>
        </List>
      </Paper>
    </div>
  )
}

export default DailyUpdate
