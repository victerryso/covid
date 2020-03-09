import React from 'react';
import _ from 'underscore';
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

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
  const previousDate = date - 86400000

  const getValue = ({ date, status }) => {
    return _.chain(props.mapData)
      .reject(country => country === 'Others')
      .pluck('data')
      .flatten()
      .where({ date })
      .pluck(status)
      .reduce((memo, value) => memo + value, 0)
      .value()
  }

  const formatValue = value => {
    if (value > 0) return `+${value.toLocaleString()}`
    if (value < 0) return `-${value.toLocaleString()}`
                   return ''
  }

  const getColor = value => {
    if (value > 0) return green[500]
    if (value < 0) return red[500]
  }

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
        .toLocaleString(),
      increment: _.chain(props.mapData)
        .filter(({ data }) => {
          return _.findWhere(data, { date }).confirmed
        })
        .pluck('country')
        .uniq()
        .reject(country => country === 'Others')
        .result('length')
        .value()
        .toLocaleString() - _.chain(props.mapData)
        .filter(({ data }) => {
          let value = _.findWhere(data, { date: previousDate })

          return value && value.confirmed
        })
        .compact()
        .pluck('country')
        .uniq()
        .reject(country => country === 'Others')
        .result('length')
        .value()
    },
    {
      label: 'Confirmed',
      value: getValue({ date, status: 'confirmed' }),
      increment: getValue({ date, status: 'confirmed' }) - getValue({ date: previousDate, status: 'confirmed' }),
    },
    {
      label: 'Deaths',
      value: getValue({ date, status: 'deaths' }),
      increment: getValue({ date, status: 'deaths' }) - getValue({ date: previousDate, status: 'deaths' }),
    },
    {
      label: 'Recovered',
      value: getValue({ date, status: 'recovered' }),
      increment: getValue({ date, status: 'recovered' }) - getValue({ date: previousDate, status: 'recovered' }),
    },
    {
      label: 'Existing',
      value: getValue({ date, status: 'existing' }),
      increment: getValue({ date, status: 'existing' }) - getValue({ date: previousDate, status: 'existing' }),
    },
  ]

  return (
    <>
      {stats.map(({ label, value, increment }, index) => (
        <div className={classes.statistic} key={index}>
          <Typography variant='h5'>
            {value.toLocaleString()}
          </Typography>

          <Typography variant='button'>
            {label}
          </Typography>

          <Typography variant='body2' style={{ color: getColor(increment) }}>
            {formatValue(increment)}
          </Typography>

        </div>
      ))}
    </>
  )
}

export default Statistics