import React, { useMemo } from 'react';
import { useTable, useFilters } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom date filter function
function dateBetweenFilterFn(rows, id, filterValues) {
  let [start, end] = filterValues;
  start = start ? new Date(start) : null;
  end = end ? new Date(end) : null;

  if (!start && !end) return rows;

  return rows.filter(row => {
    const rowDate = new Date(row.values[id]);
    if (start && end) {
      return rowDate >= start && rowDate <= end;
    } else if (start) {
      return rowDate >= start;
    } else if (end) {
      return rowDate <= end;
    }
    return true;
  });
}

dateBetweenFilterFn.autoRemove = val => !val;

const DataTableComponent = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Source Name',
        accessor: 'source_name',
        Cell: ({ row }) => (
          <a href={row.original.link} target="_blank" rel="noopener noreferrer">
            {row.original.source_name}
          </a>
        )
      },
      {
        Header: 'Date of Publication',
        accessor: 'date_of_pub',
        filter: 'dateBetween', 
      },
      {
        Header: 'Country of Publication',
        accessor: 'country_of_publication',
      },
      {
        Header: 'Associated Organizations',
        accessor: 'associated_orgs',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value
      },
      {
        Header: 'Type of Publication',
        accessor: 'type_of_pub',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value
      },
      {
        Header: 'Topics',
        accessor: 'topics',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value
      },
      {
        Header: 'Summary',
        accessor: 'summary',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters 
  );

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-md-3">
          <label htmlFor="date-from">From Date:</label>
          <input
            id="date-from"
            type="date"
            className="form-control"
            onChange={e => setFilter('date_of_pub', [e.target.value || undefined, undefined])}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="date-to">To Date:</label>
          <input
            id="date-to"
            type="date"
            className="form-control"
            onChange={e => setFilter('date_of_pub', [undefined, e.target.value || undefined])}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="country-filter">Filter by Country:</label>
          <input
            id="country-filter"
            type="text"
            className="form-control"
            placeholder="Country"
            onChange={e => setFilter('country_of_publication', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="type-filter">Filter by Type:</label>
          <input
            id="type-filter"
            type="text"
            className="form-control"
            placeholder="Type"
            onChange={e => setFilter('type_of_pub', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="topic-filter">Filter by Topic:</label>
          <input
            id="topic-filter"
            type="text"
            className="form-control"
            placeholder="Topic"
            onChange={e => setFilter('topics', e.target.value)}
          />
        </div>
      </div>
      <table {...getTableProps()} className="table table-hover table-striped">
        <thead className="thead-dark">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableComponent;
