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
    value: 'Australia',
  },
  {
    label: 'Canada',
    value: 'Canada',
  },
  {
    label: 'China',
    value: 'China',
  },
  // {
  //   label: 'United States',
  //   value: 'United States',
  // },
]

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
          avatar={<Avatar>{flags[label]}</Avatar>}
          label={label}
          onClick={() => props.handleClick({ country: value })}
          key={index}
          color={label === props.country ? 'primary' : 'default'}
        />
      ))}
    </div>
  );
}

export default CountryChips