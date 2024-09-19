import React from 'react';
import './style.css'; // change later
import { FaEnvelope } from 'react-icons/fa';

const Home = () => {
    return (
        <div>
            <header className="header">
                <a href="#" className="logo">Impact Afghanistan</a>
                <nav className="nav-items">
                    <a href="/homepage">Home</a>
                    <a href="/database">Database</a>
                    <a href="/form">Submit Research</a>
                </nav>
            </header>
            <main>
                <div className="intro">
                    <h5>The Afghan Lens: A Trusted Source for Real-Time Research</h5>
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
                        <li>Announcement 1: We have officially launched! Please submit your research&nbsp;
                            <a href="/form">here.</a>
                        </li>
                        <li>Announcement 2: Members from our organization will be presenting this project on September 20th at the United Nations Summit of the Future Action Days! More information can be found&nbsp;
                            <a href="https://powerinhervoicereimaginingagen.splashthat.com/">here.</a>
                        </li>
                    </ul>
                    <div className="iframe-container">
                        <iframe src="https://docs.google.com/presentation/d/1iRFKWUwe3Gji4jOqaJbAJJSzVeoGc3JSoNqowct2cnI/embed?start=false&loop=false&delayms=15000" frameborder="0" width="576" height="358.8" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
                        <div className="iframe-caption">September 20th Slides</div>
                    </div>
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
                <div className="copy">&copy; 2024 Impact Afghanistan - All Rights Reserved.</div>
                <div className="bottom-links">
                    <div className="links">
                        <a href="mailto:impactcompact.afghanistan@gmail.com"><FaEnvelope /> impactcompact.afghanistan@gmail.com</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
