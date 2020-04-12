import React from 'react';
import _ from 'underscore'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton'
import Close from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import countriesWithStates from '../data/countries-with-states.json'

const desc = function (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1
  if (b[orderBy] > a[orderBy]) return 1
                               return 0
}

const stableSort = function (array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

const getSorting = function (order, orderBy) {
  if (order === 'desc') return (a, b) => desc(a, b, orderBy)
                        return (a, b) => -desc(a, b, orderBy)
}

const getColor = count => {
  if (count > 0) return green[500]
  if (count < 0) return red[500]
}

const getSign = count => count > 0 ? '+' : ''

const headCells = [
  { id: 'name', numeric: false, label: 'Country' },
  { id: 'increment', numeric: true, label: 'Change' },
  { id: 'total', numeric: true, label: 'Total' },
];

const hasStates = country => countriesWithStates.includes(country)

const EnhancedTableHead = function (props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(({ id, numeric, label }) => (
          <TableCell
            key={id}
            align={numeric ? 'right' : 'left'}
            sortDirection={orderBy === id ? order : false}
          >
            <TableSortLabel
              active={orderBy === id}
              direction={order}
              onClick={createSortHandler(id)}
            >
              {label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles(theme => ({
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();

  return (
    <Toolbar>
      <Typography className={classes.title} variant="h6">
        {hasStates(props.country) ? props.country : 'Daily Increments'}

        {hasStates(props.country) ? (
          <IconButton onClick={() => props.handleClick()}>
            <Close size="small" />
          </IconButton>
        ) : ''}
      </Typography>



      <Typography variant="h6" style={{ color: getColor(props.count) }}>
        {getSign(props.count)}{props.count.toLocaleString()}
      </Typography>
    </Toolbar>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
  },
  tableWrapper: {
    overflow: 'auto',
    height: 33 * 9.5 + 38,
  },
  flag: {
    width: 19,
    marginRight: theme.spacing(1)
  },
  countryCell: {
    display: 'flex',
    alignItems: 'center',
  },
  row: {
    cursor: 'pointer',
  }
}));

const EnhancedTable = function (props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('increment');

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };

  const rows = _.chain(props.mapData)
    .filter(item => props.country && hasStates(props.country) ? item.country === props.country : true)
    .map(({ country, countryId, flag, data, state }) => {
      let pointA = data.find(({ date }) => date === props.date)
      let pointB = data.find(({ date }) => date === props.date - 86400000)

      return {
        country,
        state,
        flag,
        count: pointA[props.status],
        increment: pointA[props.status] - (pointB ? pointB[props.status] : 0),
      }
    })
    .groupBy(hasStates(props.country) ? 'state' : 'country')
    .map((items, name) => ({
      name,
      flag: items[0].flag,
      total: items.reduce((memo, { count }) => memo + (count || 0), 0),
      increment: items.reduce((memo, { increment }) => memo + (increment || 0), 0),
    }))
    .filter(({ name }) => name)
    .sortBy('name')
    .sortBy(({ total }) => -total)
    .sortBy(({ increment }) => -increment)
    .value()

  const count = rows.reduce((memo, { increment }) => memo + (increment || 0), 0)

  const countryCell = row => (
    <div className={classes.countryCell}>
      <div className={classes.flag}>{row.flag}</div>
      <div>{row.name}</div>
    </div>
  )

  const handleClick = ({ name }) => {
    let rowHasStates = hasStates(props.country)

    if (rowHasStates && props.state === name) {
      props.handleClick({ state: undefined })
    } else if (rowHasStates) {
      props.handleClick({ state: name })
    } else if (props.country === name) {
      props.handleClick({ country: undefined })
    } else {
      props.handleClick({ country: name })
    }
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          count={count}
          country={props.country}
          handleClick={props.handleClick}
        />

        <div className={classes.tableWrapper}>
          <Table
            size='small'
            stickyHeader
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getSorting(order, orderBy)).map((row, index) => (
                <TableRow
                  hover
                  onClick={() => handleClick(row)}
                  tabIndex={-1}
                  key={row.name}
                  selected={row.name === (hasStates(props.country) ? props.state : props.country)}
                  className={classes.row}
                >
                  {headCells.map(({ id, numeric }, index) => (
                    <TableCell
                      align={numeric ? 'right' : 'left'}
                      style={{ color: id === 'increment' && getColor(row[id]) }}
                      key={index}
                    >
                      {id === 'name' ? countryCell(row) : ''}
                      {id === 'increment' ? getSign(row[id]) : ''}
                      {numeric ? row[id].toLocaleString() : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Paper>
    </div>
  );
}

export default EnhancedTable