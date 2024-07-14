import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import DataTableComponent from './DataTable';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/data')
      .then(response => {
        console.log('API Response:', response.data);
        if (response.data && Array.isArray(response.data.Items)) {
          setData(response.data.Items);
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
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Afghanistan Post-2021 Research Database</h1>
        <p className="App-subtitle">A comprehensive collection of research articles and publications</p>
      </header>
      <div className="container mt-4">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <DataTableComponent data={data} />
      </div>
    </div>
  );
}

export default App;
