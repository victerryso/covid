import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import flags from '../data/country-flags.json'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(1, 0.5),
    },
  },
}));

const countries = [
  {
    label: 'Australia',
    value: 'AU',
  },
  {
    label: 'Canada',
    value: 'CA',
  },
  {
    label: 'China',
    value: 'CN',
  },
  {
    label: 'United States',
    value: 'US',
  },
]

const getFlag = country => flags[country] && flags[country].emoji

const CountryChips = function (props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Chip
        clickable
        label="Reset"
        disabled={!props.country}
        onClick={() => props.handleClick()}
      />

      {countries.map(({ label, value }, index) => (
        <Chip
          clickable
          avatar={<Avatar>{getFlag(value)}</Avatar>}
          label={label}
          onClick={() => props.handleClick(value)}
          key={index}
          color={value === props.country ? 'primary' : 'default'}
        />
      ))}
    </div>
  );
}

export default CountryChips