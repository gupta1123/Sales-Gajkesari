import React from 'react';
import CustomCalendar from './CustomCalendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloudSun, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './AttendanceCard.module.css';

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
    onDateClick: (id: number) => void;
    summary: {
        fullDays: number;
        halfDays: number;
        absentDays: number;
    };
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ employee, attendanceData, selectedYear, selectedMonth, onDateClick, summary }) => {
    const totalFullDays = summary.fullDays + attendanceData.filter(data => new Date(data.checkinDate).getDay() === 0).length;

    return (
        <div className={styles['info-card']}>
            <div className={styles.info}>
                <h2>{employee.firstName} {employee.lastName}</h2>
                <div className={styles.stats}>
                    <div className={styles['stat-box']}>
                        <FontAwesomeIcon icon={faSun} />
                        <p>Full</p>
                        <h3>{totalFullDays}</h3>
                    </div>
                    <div className={styles['stat-box']}>
                        <FontAwesomeIcon icon={faCloudSun} />
                        <p>Half</p>
                        <h3>{summary.halfDays}</h3>
                    </div>
                    <div className={styles['stat-box']}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <p>Present</p>
                        <h3>0</h3>
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
                    onDateClick={onDateClick}
                />
            </div>
        </div>
    );
};

export default AttendanceCard;
