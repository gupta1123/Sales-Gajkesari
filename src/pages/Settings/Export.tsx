// pages/Settings/Export.tsx

import React from 'react';
import SalesExecutive from './SalesExecutive';

import './Settings.css';

const Export: React.FC = () => {
    return (
        <div className="export-container">
            <div className="card-container">
                <div className="card">
                    <h3>Sales Executive</h3>
                    <SalesExecutive />
                </div>
                <div className="card">
                    <h3>Customer</h3>
                  
                </div>
            </div>
        </div>
    );
};

export default Export;