import React, { useMemo, useState, useEffect } from "react";
import { useTable, useFilters, usePagination, useSortBy } from "react-table";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import "./DataTable.css";
import { isAfter, isBefore, parseISO, compareAsc } from "date-fns";

const DataTableComponent = ({ data }) => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    console.log(`Selected Countries:`, selectedCountries);
  }, [selectedCountries]);

  useEffect(() => {
    console.log(`Selected Types:`, selectedTypes);
  }, [selectedTypes]);

  useEffect(() => {
    console.log(`Selected Topics:`, selectedTopics);
  }, [selectedTopics]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        if (document.activeElement.id === "search-for") {
          handleSearch();
        } else if (
          document.activeElement.id === "date-from" ||
          document.activeElement.id === "date-to"
        ) {
          applyDateFilter();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchInput, startDate, endDate]);

  const handleSearch = () => {
    globalSearch(searchInput, data);
  };

  const containsSubstring = (list, input) => {
    const lowerCaseInput = input.toLowerCase();
    return list.some(
      (item) => item && item.toLowerCase().includes(lowerCaseInput)
    );
  };

  const globalSearch = (input, data) => {
    if (input) {
      const filtered = data.filter((row) => {
        return (
          row.summary.toLowerCase().includes(input.toLowerCase()) ||
          row.source_name.toLowerCase().includes(input.toLowerCase()) ||
          row.country_of_publication
            .toLowerCase()
            .includes(input.toLowerCase()) ||
          containsSubstring(row.author, input) ||
          containsSubstring(row.associated_orgs, input) ||
          containsSubstring(row.type_of_pub, input) ||
          containsSubstring(row.topics, input)
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const dateBetweenFilterFn = (rows, id, filterValues) => {
    let [start, end] = filterValues.map((date) =>
      date ? parseISO(date) : null
    );

    if (!start && !end) {
      return rows;
    }

    return rows.filter((row) => {
      const rowDate = parseISO(row.values[id]);
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
    if (!filterValues) {
      return rows;
    }

    return rows.filter((row) => {
      const types = row.values[id];
      if (!types) {
        return false;
      }
      const items = Array.isArray(types)
        ? types
        : typeof types === "string"
        ? types.split(",").map((item) => item.trim())
        : [];
      if (items.length === 1) {
        return items.every((item) => filterValues.includes(item));
      } else {
        return items.some((item) => filterValues.includes(item));
      }
    });
  };

  const uniqueTopics = useMemo(() => {
    const topicsSet = new Set();
    data.forEach((row) => {
      if (Array.isArray(row.topics)) {
        row.topics.forEach((topic) => topicsSet.add(topic));
      } else if (row.topics) {
        topicsSet.add(row.topics);
      }
    });
    return Array.from(topicsSet).map((topic) => ({
      value: topic,
      label: topic,
    }));
  }, [data]);

  const uniqueTypes = useMemo(() => {
    const typeSet = new Set();
    data.forEach((row) => {
      if (Array.isArray(row.type_of_pub)) {
        row.type_of_pub.forEach((type) => typeSet.add(type));
      } else if (row.type_of_pub) {
        typeSet.add(row.type_of_pub);
      }
    });
    return Array.from(typeSet).map((type) => ({ value: type, label: type }));
  }, [data]);

  const uniqueCountries = useMemo(() => {
    const countrySet = new Set();
    data.forEach((row) => {
      if (Array.isArray(row.country_of_publication)) {
        row.country_of_publication.forEach((country) =>
          countrySet.add(country)
        );
      } else if (row.country_of_publication) {
        countrySet.add(row.country_of_publication);
      }
    });
    return Array.from(countrySet).map((country) => ({
      value: country,
      label: country,
    }));
  }, [data]);

  const handleMultiSelectChange = (filterType, selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];

    switch (filterType) {
      case "country_of_publication":
        setSelectedCountries(values);
        break;
      case "type_of_pub":
        setSelectedTypes(values);
        break;
      case "topics":
        setSelectedTopics(values);
        break;
      default:
        break;
    }

    setFilter(filterType, values.length > 0 ? values : undefined);
  };

  const applyDateFilter = () => {
    setFilter("date_of_pub", [startDate, endDate]);
  };

  const columns = useMemo(
    () => [
      {
        Header: "Source Name",
        accessor: "source_name",
        Cell: ({ row }) => (
          <a href={row.original.link} target="_blank" rel="noopener noreferrer">
            {row.original.source_name}
          </a>
        ),
        sortType: "basic",
      },
      {
        Header: "Author",
        accessor: "author",
        Cell: ({ value }) => (Array.isArray(value) ? value.join(", ") : value),
        sortType: "basic",
      },
      {
        Header: "Date of Publication",
        accessor: "date_of_pub",
        filter: "dateBetween",
        sortType: (rowA, rowB, columnId) => {
          const dateA = parseISO(rowA.values[columnId]);
          const dateB = parseISO(rowB.values[columnId]);
          return compareAsc(dateA, dateB);
        },
      },
      {
        Header: "Country of Publication",
        accessor: "country_of_publication",
        filter: "typeIn",
        sortType: "basic",
      },
      {
        Header: "Associated Organizations",
        accessor: "associated_orgs",
        Cell: ({ value }) => (Array.isArray(value) ? value.join(", ") : value),
        sortType: "basic",
      },
      {
        Header: "Type of Publication",
        accessor: "type_of_pub",
        Cell: ({ value }) => (Array.isArray(value) ? value.join(", ") : value),
        filter: "typeIn",
        sortType: "basic",
      },
      {
        Header: "Topics",
        accessor: "topics",
        Cell: ({ value }) => (Array.isArray(value) ? value.join(", ") : value),
        filter: "typeIn",
        sortType: "basic",
      },
      {
        Header: "Summary",
        accessor: "summary",
        Cell: ({ value }) => {
          // add state for managing expanded summaries
          const [isExpanded, setIsExpanded] = useState(false);

          // toggle the expanded state
          const handleToggle = () => setIsExpanded(!isExpanded);

          // make text short if not expanded
          const summaryText = isExpanded ? value : `${value.slice(0, 100)}...`;

          return (
            <>
              {summaryText}
              {value.length > 100 && (
                <button onClick={handleToggle} className="btn btn-link">
                  {isExpanded ? "Read less" : "Read more"}
                </button>
              )}
            </>
          );
        },

        disableSortBy: true, // Disable sorting for the summary column
      },
    ],
    []
  );

  const filterTypes = useMemo(
    () => ({
      dateBetween: dateBetweenFilterFn,
      typeIn: typeInFilterFn,
    }),
    []
  );

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
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 10 },
      filterTypes,
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <i>
          Note: Summaries and dates for certain articles are not available yet -
          we are working on it! Certain summaries were created with the help of
          OpenAI's API.{" "}
        </i>{" "}
        <br></br> <br></br>
        <br></br>{" "}
        <b>Use the filters below to search and filter the research database:</b>
      </div>
      <div className="row mb-4">
        <div className="col-md-2">
          <label htmlFor="date-from">From Date:</label>
          <input
            id="date-from"
            type="date"
            className="form-control"
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="date-to">To Date:</label>
          <input
            id="date-to"
            type="date"
            className="form-control"
            placeholder="YYYY-MM-DD"
            onChange={(e) => setEndDate(e.target.value)}
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
          <label htmlFor="country-filter">
            Filter by Country of Publication:
          </label>
          <Select
            id="country-filter"
            isMulti
            options={uniqueCountries}
            onChange={(selectedOptions) =>
              handleMultiSelectChange("country_of_publication", selectedOptions)
            }
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="type-filter">Filter by Type of Publication:</label>
          <Select
            id="type-filter"
            isMulti
            options={uniqueTypes}
            onChange={(selectedOptions) =>
              handleMultiSelectChange("type_of_pub", selectedOptions)
            }
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="topic-filter">Filter by Topic:</label>
          <Select
            id="topic-filter"
            isMulti
            options={uniqueTopics}
            onChange={(selectedOptions) =>
              handleMultiSelectChange("topics", selectedOptions)
            }
          />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-10 d-flex align-items-center">
          <label htmlFor="page-selection" className="mr-2 mb-0">
            Publications Per Page: &nbsp;{" "}
          </label>
          <select
            id="page-selection"
            className="form-control"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ width: "auto" }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2 d-flex justify-content-end">
          <div
            className="d-flex align-items-center"
            style={{ whiteSpace: "nowrap" }}
          >
            <input
              id="search-for"
              type="text"
              size="large"
              name="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for content (e.g., topic, type, author)"
              className="form-control"
              style={{ width: "auto", minWidth: "340px", marginRight: "5px" }} // Add this inline style
            />
            <button onClick={handleSearch} className="btn btn-primary">
              Apply Search
            </button>
          </div>
        </div>
        <div>
          <br></br>
          <b>Click on a header to sort the results!</b>
        </div>
      </div>
      <table {...getTableProps()} className="table table-hover table-striped">
        <thead className="thead-dark">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? column.id === "date_of_pub"
                          ? " (Descending)"
                          : " (Z - A)"
                        : column.id === "date_of_pub"
                        ? " (Ascending)"
                        : " (A - Z)"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row mb-4">
        <div
          className="col-md-12 d-flex justify-content-end"
          style={{ fontSize: "0.875em" }}
        >
          <div className="pagination">
            <button
              className="btn btn-outline-dark mr-2"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {"<<"}
            </button>{" "}
            <button
              className="btn btn-outline-dark mr-2"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              {"<"}
            </button>{" "}
            <button
              className="btn btn-outline-dark mr-2"
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              {">"}
            </button>{" "}
            <button
              className="btn btn-outline-dark mr-2"
              onClick={() => gotoPage(pageOptions.length - 1)}
              disabled={!canNextPage}
            >
              {">>"}
            </button>{" "}
            <span className="align-middle ml-2">
              Page {pageIndex + 1} of {pageOptions.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTableComponent;
