import React, { useState } from 'react';
import CustomCalendar from './CustomCalendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloudSun, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './AttendanceCard.module.css';
import { useVisitList } from '../contexts/VisitListContext';

interface AttendanceData {
    id: number;
    employeeId: number;
    employeeName: string;
    attendanceStatus: 'full day' | 'half day' | 'Absent';
    checkinDate: string;
    checkoutDate: string;
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
}

interface AttendanceCardProps {
    employee: Employee;
    attendanceData: AttendanceData[];
    selectedYear: number;
    selectedMonth: number;
    initialSummary: {
        fullDays: number;
        halfDays: number;
        absentDays: number;
    };
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ employee, attendanceData, selectedYear, selectedMonth, initialSummary }) => {
    const { setFilters } = useVisitList();
    const [summary, setSummary] = useState(initialSummary);

    const handleSummaryChange = (newSummary: { fullDays: number; halfDays: number; absentDays: number }) => {
        setSummary(newSummary);
    };

    return (
        <div className={styles['info-card']}>
            <div className={styles.info}>
                <h2>{employee.firstName} {employee.lastName}</h2>
                <div className={styles.stats}>
                    <div className={styles['stat-box']}>
                        <FontAwesomeIcon icon={faSun} />
                        <p>Full</p>
                        <h3>{summary.fullDays}</h3>
                    </div>
                    <div className={styles['stat-box']}>
                        <FontAwesomeIcon icon={faCloudSun} />
                        <p>Half</p>
                        <h3>{summary.halfDays}</h3>
                    </div>
                    <div className={styles['stat-box']}>
                        <FontAwesomeIcon icon={faTimesCircle} />
                        <p>Absent</p>
                        <h3>{summary.absentDays}</h3>
                    </div>
                </div>
            </div>
            <div className={styles['calendar-container']}>
                <CustomCalendar
                    month={selectedMonth}
                    year={selectedYear}
                    attendanceData={attendanceData.filter(data => data.employeeId === employee.id)}
                    onSummaryChange={handleSummaryChange}
                    employeeName={`${employee.firstName} ${employee.lastName}`} // Pass employee name
                />
            </div>
        </div>
    );
};

export default AttendanceCard;