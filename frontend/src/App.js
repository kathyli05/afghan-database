import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import DataTableComponent from "./DataTable";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");

  // useEffect(() => {
  //   axios.get('/data')
  //     .then(response => {
  //       console.log('API Response:', response.data);
  //       if (response.data && Array.isArray(response.data.Items)) {
  //         setData(response.data.Items);
  //         setFilteredData(response.data.Items);
  //         console.log(response.data.Items);
  //       } else {
  //         console.error('Unexpected data format:', response.data);
  //         setError('Unexpected data format received from the server.');
  //       }
  //     })
  //     .catch(error => {
  //       setError('Error fetching data');
  //       console.error('Error fetching data:', error);
  //     });
  // }, []);

  // backend deployed through render
  useEffect(() => {
    axios
      .get("https://afghan-database.onrender.com/data")
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data && Array.isArray(response.data.Items)) {
          setData(response.data.Items);
          setFilteredData(response.data.Items);
        } else {
          console.error("Unexpected data format:", response.data);
          setError("Unexpected data format received from the server.");
        }
      })
      .catch((error) => {
        setError("Error fetching data");
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
  };

  const handleSearch = () => {
    console.log(searchInput);
    console.log(data[0].source_name);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Afghanistan Post-2021 Research Database</h1>
        <p className="App-subtitle">
          A comprehensive collection of research articles and publications
        </p>
      </header>
      <div className="container mt-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row mb-4">
          <div className="col-md-4">
            <input
              type="text"
              size="large"
              name="searchInput"
              value={searchInput}
              onChange={handleChange}
              placeholder="Search for content (e.g., topic, type, author)"
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <button onClick={handleSearch} className="btn btn-primary">
              Apply Search
            </button>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-12">
            <DataTableComponent
              data={filteredData.length ? filteredData : data}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// code reference: https://stackoverflow.com/questions/56833671/implementing-a-global-search-filter-across-react-table-react-react-table
