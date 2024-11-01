import { useEffect, useState } from 'react';
import axios from 'axios';

const WebsiteTable = () => {
    const [websites, setWebsites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'url', direction: 'asc' });
    const websitesPerPage = 5;

    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/websites');
                setWebsites(response.data);
            } catch (error) {
                console.error("Error fetching websites:", error);
            }
        };

        fetchWebsites();
    }, []);

    const filteredWebsites = websites
        .filter((website) => 
            website.url.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortConfig.key === 'lastChecked') {
                return sortConfig.direction === 'asc'
                    ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
                    : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
            } else {
                return sortConfig.direction === 'asc'
                    ? a[sortConfig.key].localeCompare(b[sortConfig.key])
                    : b[sortConfig.key].localeCompare(a[sortConfig.key]);
            }
        });

    const totalPages = Math.ceil(filteredWebsites.length / websitesPerPage);

    const displayedWebsites = filteredWebsites.slice(
        (currentPage - 1) * websitesPerPage,
        currentPage * websitesPerPage
    );

    const handleCheckStatus = async (id, url) => {
        console.log("Checking status for URL:", url); 
        try {
            const response = await axios.post('http://localhost:5000/api/websites/check-status', { id, url });
            console.log("Response from backend:", response.data); 
    
            const updatedStatus = response.data.status;
            setWebsites((prevWebsites) =>
                prevWebsites.map((website) =>
                    website.id === id ? { ...website, status: updatedStatus, lastChecked: new Date() } : website
                )
            );
            console.log("Updated websites state:", websites); 
        } catch (error) {
            console.error("Error checking status:", error);
            alert("Failed to check website status. Please try again.");
        }
    };
    
    const handleVisitWebsite = (url) => {
        window.open(url, '_blank');
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div>


            {/* Search Input */}
            <input
            className='search-box'
                type="text"
                placeholder="Search by URL"
                value={searchTerm}
                onChange={handleSearch}
                
            />

            <table className='table-box'>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('url')} style={{ cursor: 'pointer' }}>
                            URL {sortConfig.key === 'url' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                            Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => handleSort('lastChecked')} style={{ cursor: 'pointer' }}>
                            Last Checked {sortConfig.key === 'lastChecked' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedWebsites.map((website) => (
                        <tr key={website.id} style={{ backgroundColor: website.status === 'Down' ? 'red' : 'transparent' }}>
                            <td>{website.url}</td>
                            <td>{website.status}</td>
                            <td>{new Date(website.lastChecked).toLocaleString()}</td>
                            <td>
                                <button onClick={() => handleCheckStatus(website.id, website.url)} className='btn-all'>
                                    Check Status
                                </button>
                                <button onClick={() => handleVisitWebsite(website.url)} className='btn-all'>
                                    Visit Website
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className='pagination'>
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='btn-all'
                >
                    Previous
                </button>

                <span>Page {currentPage} of {totalPages}</span>

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='btn-all'
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default WebsiteTable;
