import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Database.css'; 
import DataTableComponent from './DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEnvelope } from 'react-icons/fa';

const Database = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/data')
      .then(response => {
        console.log('API Response:', response.data);
        if (response.data && Array.isArray(response.data.Items)) {
          setData(response.data.Items);
          setFilteredData(response.data.Items);
          console.log(response.data.Items);
        } else {
          console.error('Unexpected data format:', response.data);
          setError('Unexpected data format received from the server.');
        }
      })
      .catch(error => {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleChange = event => {
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
    return list.some(item => item && item.toLowerCase().includes(lowerCaseInput));
  };

  const globalSearch = (input, data) => {
    if (input) {
      const filtered = data.filter(row => {
        return (
          row.summary.toLowerCase().includes(input.toLowerCase()) ||
          row.source_name.toLowerCase().includes(input.toLowerCase()) ||
          row.country_of_publication.toLowerCase().includes(input.toLowerCase()) ||
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
    <div>
            <header className="header">
                <a href="#" className="logo">Project Afghanistan</a>
                <nav className="nav-items">
                    <a href="/homepage">Home</a>
                    <a href="/database">Database</a>
                    <a href="/form">Submit Research</a>
                </nav>
            </header>
            <main>
                <div className="intro">
                    <p>The database consists of articles on human rights condition in Afghanistan 
                        post 2021. (to be modified. more description of the features.)
                    </p>
                </div>
                <div className="table">
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <DataTableComponent data={filteredData.length ? filteredData : data} />
                        </div>
                    </div>
                </div>
            </main>
            <footer className="footer">
                <div className="copy">&copy; 2024 Project Afghanistan - All Rights Reserved.</div>
                <div className="bottom-links">
                    <div className="links">
                        <span>Contact us: </span>
                        <a href="mailto:info@projectafghanistan.org"><FaEnvelope /> info@projectafghanistan.org</a>
                    </div>
                </div>
            </footer>
        </div>
  );
};

export default Database;
