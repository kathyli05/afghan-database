import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Database.css'; 
import DataTableComponent from './DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEnvelope } from 'react-icons/fa';

const Database = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  const filterData = (data) => {
    const filter_data = data.filter(item => item.source_name !== 'Test' && item.source_name !== 'Test2');
    return filter_data
  };

  const env_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${env_url}/data`)
      .then(response => {
        console.log('API Response:', response.data);
        if (response.data && Array.isArray(response.data.Items)) {
          setData(filterData(response.data.Items));
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


  return (
    <div>
            <header className="header">
                <a className="logo">Project Afghanistan</a>
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
                            <DataTableComponent data={data} />
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
