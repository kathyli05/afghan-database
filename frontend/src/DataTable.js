import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useFilters, usePagination } from 'react-table';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DataTable.css';
import { isAfter, isBefore, parseISO } from 'date-fns';

const DataTableComponent = ({ data }) => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    console.log(`Selected Countries:`, selectedCountries);
  }, [selectedCountries]);

  useEffect(() => {
    console.log(`Selected Types:`, selectedTypes);
  }, [selectedTypes]);

  useEffect(() => {
    console.log(`Selected Topics:`, selectedTopics);
  }, [selectedTopics]);

  // Custom filtering function using date-fns
  const dateBetweenFilterFn = (rows, id, filterValues) => {
    console.log('dateBetweenFilterFn called with filterValues:', filterValues);
    let [start, end] = filterValues.map(date => date ? parseISO(date) : null);
    console.log('Start Date:', start);
    console.log('End Date:', end);
    
    if (!start && !end) {
      return rows;
    }

    return rows.filter(row => {
      const rowDate = parseISO(row.values[id]);
      console.log('Row Date:', rowDate);
      if (!rowDate) {
        return false;
      }
      if (start && end) {
        return isAfter(rowDate, start) && isBefore(rowDate, end);
      } else if (start) {
        return isAfter(rowDate, start);
      } else if (end) {
        return isBefore(rowDate, end);
      }
      return true;
    });
  };

  const typeInFilterFn = (rows, id, filterValues) => {
    console.log('typeInilterFn called with filterValues:', filterValues);
    if (!filterValues) {
      return rows;
    }
    
    return rows.filter(row => {
      const types = row.values[id];
      if (!types) {
        return false;
      }
      console.log(types);
      const items = Array.isArray(types) ? types : (typeof types === 'string' ? types.split(',').map(item => item.trim()) : []);
      // e.g., the value is 'News', the filter value is ['News, Research']
      if (items.length === 1) {
        return items.every(item => filterValues.includes(item));
      }
      else {
        // e.g., the value is ['News', 'Research'], the filter value is ['News', 'Research', 'NGO Report']
        return items.some(item => filterValues.includes(item));
      }
    })
  }

  // Create sets of unique topics, publication types, and countries of publication
  const uniqueTopics = useMemo(() => {
    const topicsSet = new Set();
    data.forEach(row => {
      if (Array.isArray(row.topics)) {
        row.topics.forEach(topic => topicsSet.add(topic));
      } else if (row.topics) {
        topicsSet.add(row.topics);
      }
    });
    return Array.from(topicsSet).map(topic => ({ value: topic, label: topic }));
  }, [data]);

  const uniqueTypes = useMemo(() => {
    const typeSet = new Set();
    data.forEach(row => {
      if (Array.isArray(row.type_of_pub)) {
        row.type_of_pub.forEach(type => typeSet.add(type));
      } else if (row.type_of_pub) {
        typeSet.add(row.type_of_pub);
      }
    });
    return Array.from(typeSet).map(type => ({ value: type, label: type }));
  }, [data]);

  const uniqueCountries = useMemo(() => {
    const countrySet = new Set();
    data.forEach(row => {
      if (Array.isArray(row.country_of_publication)) {
        row.country_of_publication.forEach(country => countrySet.add(country));
      } else if (row.country_of_publication) {
        countrySet.add(row.country_of_publication);
      }
    });
    return Array.from(countrySet).map(country => ({ value: country, label: country }));
  }, [data]);

  // Handle multiple value selection for country, type, and topic
  const handleMultiSelectChange = (filterType, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log(`Filter Type: ${filterType}`);
    console.log(`Selected Options:`, values);
    
    switch (filterType) {
      case 'country_of_publication':
        setSelectedCountries(values);
        break;
      case 'type_of_pub':
        setSelectedTypes(values);
        break;
      case 'topics':
        setSelectedTopics(values);
        break;
      default:
        break;
    }
    
    // Use values directly since the state hasn't updated yet
    setFilter(filterType, values.length > 0 ? values : undefined);
  };
  

  const applyDateFilter = () => {
    console.log('Applying Date Filter');
    console.log(startDate);
    console.log(endDate);
    setFilter('date_of_pub', [startDate, endDate]);
  };

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
        Header: 'Author',
        accessor: 'author',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value
      },
      {
        Header: 'Date of Publication',
        accessor: 'date_of_pub',
        filter: 'dateBetween'
      },
      {
        Header: 'Country of Publication',
        accessor: 'country_of_publication',
        filter: 'typeIn'
      },
      {
        Header: 'Associated Organizations',
        accessor: 'associated_orgs',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value
      },
      {
        Header: 'Type of Publication',
        accessor: 'type_of_pub',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value,
        filter: 'typeIn'
      },
      {
        Header: 'Topics',
        accessor: 'topics',
        Cell: ({ value }) => Array.isArray(value) ? value.join(', ') : value,
        filter: 'typeIn'
      },
      {
        Header: 'Summary',
        accessor: 'summary',
      },
    ],
    []
  );

  const filterTypes = useMemo(() => ({
    dateBetween: dateBetweenFilterFn,
    // countryIn: countryInFilterFn,
    typeIn: typeInFilterFn,
    // topicIn: topicInFilterFn
  }), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex, pageSize },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    prepareRow,
    setFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      filterTypes,
    },
    useFilters,
    usePagination
  );

  console.log('Table Data:', data);
  console.log('Page Index:', pageIndex);
  console.log('Page Size:', pageSize);
  console.log('Page Count:', pageOptions.length);
  // console.log('Selected Countries:', selectedCountries);
  // console.log('Selected Types:', selectedTypes);
  // console.log('Selected Topics:', selectedTopics);

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-md-2">
          <label htmlFor="pagination">Results Per Page</label>
          <select
            id="page-selection"
            className="form-control"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label htmlFor="date-from">From Date:</label>
          <input
            id="date-from"
            type="date"
            className="form-control"
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="date-to">To Date:</label>
          <input
            id="date-to"
            type="date"
            className="form-control"
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 mt-4">
          <button className="btn btn-primary" onClick={applyDateFilter}>
            Apply Date Filter
          </button>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="country-filter">Filter by Country:</label>
          <Select
            id="country-filter"
            isMulti
            options={uniqueCountries}
            onChange={selectedOptions => handleMultiSelectChange('country_of_publication', selectedOptions)}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="type-filter">Filter by Type:</label>
          <Select
            id="type-filter"
            isMulti
            options={uniqueTypes}
            onChange={selectedOptions => handleMultiSelectChange('type_of_pub', selectedOptions)}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="topic-filter">Filter by Topic:</label>
          <Select
            id="topic-filter"
            isMulti
            options={uniqueTopics}
            onChange={selectedOptions => handleMultiSelectChange('topics', selectedOptions)}
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
          {page.map(row => {
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
      <div className="pagination mt-3">
        <button className="btn btn-outline-dark mr-2" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button className="btn btn-outline-dark mr-2" onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button className="btn btn-outline-dark mr-2" onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button className="btn btn-outline-dark mr-2" onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span className="align-middle ml-2">
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
      </div>
    </div>
  );
};

export default DataTableComponent;
