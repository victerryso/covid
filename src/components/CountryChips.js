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
    id: 'AU',
    label: 'Australia',
    value: 'Australia',
  },
  {
    id: 'CA',
    label: 'Canada',
    value: 'Canada',
  },
  {
    id: 'CN',
    label: 'China',
    value: 'China',
  },
  {
    id: 'US',
    label: 'United States',
    value: 'United States',
  },
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

      {countries.map(({ id, label, value }, index) => (
        <Chip
          clickable
          avatar={<Avatar>{flags[id]}</Avatar>}
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