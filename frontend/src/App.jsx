import React from 'react';
import AddWebsite from './components/AddWebsites.jsx';
import WebsiteTable from './components/WebsiteTable.jsx';
import './App.css';

function App() {
    return (
        <div>
            <h1>Website Monitoring Tool</h1>
            <WebsiteTable />
            <AddWebsite />
           
        </div>
    );
}

export default App;
