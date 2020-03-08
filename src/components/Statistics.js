import React from 'react';
import _ from 'underscore';
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  statistic: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
}))

const Statistics = function (props) {
  const classes = useStyles()
  const date = props.date

  let stats = [
    {
      label: 'Countries',
      value: _.chain(props.mapData)
        .filter(({ data }) => {
          return _.findWhere(data, { date }).confirmed
        })
        .pluck('country')
        .uniq()
        .reject(country => country === 'Others')
        .result('length')
        .value()
        .toLocaleString()
    },
    {
      label: 'Confirmed',
      value: _.chain(props.mapData)
        .reject(country => country === 'Others')
        .pluck('data')
        .flatten()
        .where({ date })
        .pluck('confirmed')
        .reduce((memo, value) => memo + value, 0)
        .value()
        .toLocaleString()
    },
    {
      label: 'Deaths',
      value: _.chain(props.mapData)
        .reject(country => country === 'Others')
        .pluck('data')
        .flatten()
        .where({ date })
        .pluck('deaths')
        .reduce((memo, value) => memo + value, 0)
        .value()
        .toLocaleString()
    },
    {
      label: 'Recovered',
      value: _.chain(props.mapData)
        .reject(country => country === 'Others')
        .pluck('data')
        .flatten()
        .where({ date })
        .pluck('recovered')
        .reduce((memo, value) => memo + value, 0)
        .value()
        .toLocaleString()
    },
    {
      label: 'Existing',
      value: _.chain(props.mapData)
        .reject(country => country === 'Others')
        .pluck('data')
        .flatten()
        .where({ date })
        .pluck('existing')
        .reduce((memo, value) => memo + value, 0)
        .value()
        .toLocaleString()
    },
  ]

  return (
    <>
      {stats.map(({ label, value }, index) => (
        <div className={classes.statistic} key={index}>
          <Typography variant='h5'>
            {value}
          </Typography>

          <Typography variant='button'>
            {label}
          </Typography>
        </div>
      ))}
    </>
  )
}

export default Statistics