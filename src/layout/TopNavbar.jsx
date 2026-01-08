
import React from 'react';
import './layout.css';

function TopNavbar() {
    return (
        <div className="top-navbar">
            {/* Existing navbar content */}
            
            <div className="top-right-buttons">
                <button className="top-btn">Focus</button>
                <button className="top-btn">Compiler</button>
                <button className="top-btn">Progress</button>
                <button className="top-btn">Settings</button>
            </div>
        </div>
    );
}

export default TopNavbar;

