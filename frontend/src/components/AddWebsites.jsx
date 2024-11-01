import { useState } from 'react';
import axios from 'axios';

const AddWebsites = () => {
    const [url, setUrl] = useState('');

    const handleAdd = async () => {
        
        if (!/^https?:\/\//i.test(url)) {
            alert("URL should start with 'http://' or 'https://'");
            return;
        }
    
        try {
            
            await axios.post('http://localhost:5000/api/websites/add', { url });
            setUrl(''); 
        } catch (error) {
            
            console.error("Error adding website:", error);
            alert("Failed to add website. Please try again.");
        }
    };
    return (
        <div className='input-box'>
            <input
                type="text"
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={handleAdd}>Add Website</button>
        </div>
    )
}

export default AddWebsites;
