import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Database from './Database';
import Submit from './Submit';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homepage" element={<Home />} />
        <Route path="/database" element={<Database />} />
        <Route path="/form" element={<Submit />} />
      </Routes>
    </Router>
  );
};

export default App;


// // code reference: https://stackoverflow.com/questions/56833671/implementing-a-global-search-filter-across-react-table-react-react-table
