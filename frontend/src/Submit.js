import React from 'react';
import './style.css';
import { FaEnvelope } from 'react-icons/fa';

const SubmitResearch = () => {
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
                    <h1>Submit Your Research</h1>
                    <p>Contribute to our growing database by submitting relevant research or recommending a publication! Fill out the form below to get started.</p>
                    <a href="https://forms.gle/DooRr8U5k4rxiTHRA" target="_blank" rel="noopener noreferrer">
                        <button>Go to form</button>
                    </a>
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

export default SubmitResearch;
