import { useState } from 'react';
import { useSelector } from 'react-redux';
import Salary from './Salary';
import Allowance from './Allowance';
import WorkingDays from './WorkingDays';
import styles from './Settings.module.css';
import { RootState } from '../store'; // Import the RootState type from the store

export default function Settings() {
    const [activeTab, setActiveTab] = useState('salary');
    const authToken = useSelector((state: RootState) => state.auth.token); // Use the correct path for RootState

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.tabHeader}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'salary' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('salary')}
                >
                    Salary
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'allowance' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('allowance')}
                >
                    Allowance
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'workingDays' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('workingDays')}
                >
                    Working Days
                </button>
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'salary' && <Salary authToken={authToken} />}
                {activeTab === 'allowance' && <Allowance authToken={authToken} />}
                {activeTab === 'workingDays' && <WorkingDays authToken={authToken} />}
            </div>
        </div>
    );
}