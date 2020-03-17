import React from 'react';
import moment from 'moment'
import _ from 'underscore'
import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(1, 2),
  },
}));

const Timeline = function (props) {
  const classes = useStyles();

  const formatLabel = value => moment.utc(value).format('Do')

  const marks = _.chain(props.min)
    .range(props.max + props.step, props.step)
    .map(date => moment.utc(date))
    .filter(moment => moment.date() === 1)
    .map(moment => ({
      label: moment.format('MMM'),
      value: +moment,
    }))
    .value()

  return (
    <div className={classes.container}>
      <Slider
        min={props.min}
        max={props.max}
        step={props.step}
        marks={marks}
        value={props.value}
        onChange={(event, value) => props.handleChange(value)}
        valueLabelDisplay='auto'
        valueLabelFormat={formatLabel}
      />
    </div>
  )
}

export default Timeline