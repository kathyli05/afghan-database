import React from 'react';
import './style.css'; // change later
import { FaEnvelope } from 'react-icons/fa';

const Home = () => {
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
                    <h1>Insert catchy phrase</h1>
                    <p>This project aims to address the lack of visibility into and accurate information coming out of
                        Afghanistan since the Taliban seized power in 2021. Academics, NGOs, and the international community continue to seek ways to provide accurate and
                        up-to-date, verifiable reporting on the situation in Afghanistan. This project brings together current reports in a single-source platform, where scholars and others may search
                        and access curated and verified research.
                    </p>
                    <a href="/database">
                        <button>Go to database</button>
                    </a>
                </div>

                <div className="featured-article">
                    <div className="featured-article-text">
                        <h2>Featured Article</h2>
                        <p className="research-title">‘Then, We Lost Everything:’ Afghan Evacuee Experiences of Operation Allies Refuge and Operation Allies Welcome</p>
                        <p className="author">Alexandria J. Nylen, et al.</p>
                        <p className="publication-date">Published in April 2023</p>
                        <p className="summary">From Executive Summary: This report examines OAR and Operation Allies Welcome (OAW) from the perspectives of those most affected - the Afghan evacuees themselves. This research is structured around two
                            overarching questions: 1) What are the experiences and perceptions held by Afghan evacuees during Operation Allies Refuge and Operation Allies Welcome? 2) What are the immediate and long term needs within the Afghan evacuee
                            population resettling in Rhode Island?</p>
                        <a href="https://watson.brown.edu/chrhs/files/chrhs/imce/research/RDC%20Report_FINAL.pdf">Read more</a>
                    </div>
                    <img src="https://as1.ftcdn.net/v2/jpg/05/31/43/34/1000_F_531433456_RJvPyap9TwrmdFI55K4sZdpXNJS8sPit.jpg"
                        alt="Featured Article" width="500" height="600" />
                </div>
                <div className="announcements">
                    <h1>Announcements</h1>
                    <ul>
                        <li>Announcement 1: We have officially launched! Please submit your research
                            <a href="/form"> here.</a>
                        </li>
                    </ul>
                </div>
                <div className="resources">
                    <img src="https://img1.wsimg.com/isteam/ip/0a898bff-bebb-498c-9f39-4f537ac3dc49/blob-04245ea.png/:/fx-gs/rs=w:984,h:657"
                        alt="Resources" width="500" height="600" />
                    <div className="resources-text">
                        <h2>Other Resources</h2>
                        <ul>
                            <li><a href="https://impactafghanistan.org/">Impact Afghanistan</a></li>
                            <li><a href="https://dsi.brown.edu/">Brown Data Science Institute</a></li>
                            <li><a href="https://library.brown.edu/create/cds/projects/">Brown Center for Digital Scholarship</a></li>
                            <li><a href="https://watson.brown.edu/southasia/">Brown Watson Institute's Center for Contemporary South Asia</a></li>
                            <li><a href="https://www.un.org/en/summit-of-the-future/">UN Summit of the Future</a></li>
                        </ul>
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

export default Home;
