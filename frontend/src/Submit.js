import React, { useEffect, useState } from "react";
import "./style.css";
import { FaEnvelope } from "react-icons/fa";

const SubmitResearch = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="page-container">
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
          <h5>Submit Your Research</h5>
          <p>
            Contribute to our growing database by submitting relevant research
            or recommending a publication! Fill out the form below to get
            started.
          </p>
          <a
            href="https://forms.gle/DooRr8U5k4rxiTHRA"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button>Go to form</button>
          </a>
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

export default SubmitResearch;
