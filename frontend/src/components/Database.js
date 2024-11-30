import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Database.css";
import DataTableComponent from "./DataTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEnvelope } from "react-icons/fa";

const Database = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const filterData = (data) => {
    const filter_data = data.filter(
      (item) => item.source_name !== "Test" && item.source_name !== "Test2"
    );
    return filter_data;
  };

  const env_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios
      .get(`${env_url}/data`)
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data && Array.isArray(response.data.Items)) {
          setData(filterData(response.data.Items));
          console.log(response.data.Items);
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

  return (
    <div>
      <header className="header">
        <a href="/homepage" className="logo">
          Impact Afghanistan
        </a>
        <nav className="nav-items">
          <a href="/homepage">
            <b>Home</b>
          </a>
          <a href="/database">Database</a>
          <a href="/form">Submit Research</a>
        </nav>

        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Menu</span>
          <div className="hamburger-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>
      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <nav className="mobile-menu-content">
          <a href="/homepage">Home</a>
          <a href="/database">Database</a>
          <a href="/form">Submit Research</a>
        </nav>
      </div>

      <main>
        <div className="intro">
          <h5>About the Database</h5>
          <p>
            This database is a comprehensive collection of articles, reports,
            and publications focusing on human rights, social, political, and
            economic conditions in Afghanistan since the Taliban's takeover in
            2021. Users can filter results by publication date, country of
            publication, type of publication, and topic, making it easier to
            locate specific resources. Explore curated research from various
            academic institutions, governmental organizations, and NGOs,
            providing insights into the ongoing challenges and developments in
            Afghanistan.
          </p>
        </div>
        <div className="table">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <div className="row mb-4">
            <div className="col-md-12">
              <DataTableComponent data={data} />
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="copy">
          &copy; 2024 Impact Afghanistan - All Rights Reserved.
        </div>
        <div className="bottom-links">
          <div className="links">
            <a href="mailto:impactcompact.afghanistan@gmail.com">
              <FaEnvelope /> impactcompact.afghanistan@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Database;
