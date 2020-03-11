import React from 'react';
import _ from 'underscore';
import Typography from '@material-ui/core/Typography'
import Hidden from '@material-ui/core/Hidden';
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
      .filter(({ country }) => props.country ? country === props.country : true)
      .reject(country => country === 'Others')
      .pluck('data')
      .flatten()
      .where({ date })
      .pluck(status)
      .reduce((memo, value) => memo + value, 0)
      .value()
  }

  const getIncrementValue = status => {
    return getValue({ date, status }) - getValue({ date: previousDate, status})
  }

  const getCountryValue = date => {
    if (props.country) {
      return 1
    }

    return _.chain(props.mapData)
      .filter(({ country }) => props.country ? country === props.country : true)
      .reject(country => country === 'Others')
      .filter(({ data }) => _.findWhere(data, { date }).confirmed)
      .pluck('country')
      .uniq()
      .result('length')
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
      value: getCountryValue(date).toLocaleString(),
      increment: getCountryValue(date) - getCountryValue(previousDate),
      hideOnSmall: true,
    },
    {
      label: 'Confirmed',
      value: getValue({ date, status: 'confirmed' }),
      increment: getIncrementValue('confirmed'),
      hideOnSmall: false,

    },
    {
      label: 'Deaths',
      value: getValue({ date, status: 'deaths' }),
      increment: getIncrementValue('deaths'),
      hideOnSmall: false,

    },
    {
      label: 'Recovered',
      value: getValue({ date, status: 'recovered' }),
      increment: getIncrementValue('recovered'),
      hideOnSmall: false,

    },
    {
      label: 'Existing',
      value: getValue({ date, status: 'existing' }),
      increment: getIncrementValue('existing'),
      hideOnSmall: true,

    },
  ]

  return (
    <>
      {stats.map(({ label, value, increment, hideOnSmall }, index) => (
        <Hidden xsDown={hideOnSmall} key={index}>
          <div className={classes.statistic}>
            <Typography variant='h5'>
              {value.toLocaleString()}
            </Typography>

            <Typography variant='button'>
              {label}
            </Typography>

            <Typography variant='body2' style={{ color: getColor(increment) }}>
              {formatValue(increment) || '\u00A0'}
            </Typography>

          </div>
        </Hidden>
      ))}
    </>
  )
}

export default Statistics