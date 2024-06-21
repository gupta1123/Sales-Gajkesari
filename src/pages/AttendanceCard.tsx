import React from 'react';
import CustomCalendar from './CustomCalendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarAlt, faCheck, faTimes, faIdBadge, faBuilding, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import styles from './AttendanceCard.module.css';

interface AttendanceData {
    id: number;
    employeeId: number;
    employeeName: string;
    attendanceStatus: 'full day' | 'half day' | 'Present' | 'Absent';
    checkinDate: string;
    checkoutDate: string;
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
    position: string;
}

interface AttendanceCardProps {
    employee: Employee;
    attendanceData: AttendanceData[];
    selectedYear: number;
    selectedMonth: number;
    onDateClick: (date: string) => void;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ employee, attendanceData, selectedYear, selectedMonth, onDateClick }) => {
    const getAttendanceSummary = (employeeId: number) => {
        const employeeAttendance = attendanceData.filter(data => data.employeeId === employeeId);
        const fullDays = employeeAttendance.filter(data => data.attendanceStatus === 'full day').length;
        const halfDays = employeeAttendance.filter(data => data.attendanceStatus === 'half day').length;
        const presentDays = employeeAttendance.filter(data => data.attendanceStatus === 'Present').length;
        const absentDays = employeeAttendance.filter(data => data.attendanceStatus === 'Absent').length;

        return { fullDays, halfDays, presentDays, absentDays };
    };

    const summary = getAttendanceSummary(employee.id);

    return (
        <div className={styles['info-card']}>
            <div className={styles.info}>
                <h2>{employee.firstName} {employee.lastName}</h2>
                <p><FontAwesomeIcon icon={faIdBadge} /> Employee ID: {employee.employeeId}</p>
                <p><FontAwesomeIcon icon={faBuilding} /> Department: {employee.department}</p>
                <p><FontAwesomeIcon icon={faBriefcase} /> Position: {employee.position}</p>
                <div className={styles.stats}>
                    <div className={styles['stat-card']}>
                        <FontAwesomeIcon icon={faCalendarDay} />
                        <div>
                            <p>Full Days</p>
                            <h3>{summary.fullDays}</h3>
                        </div>
                    </div>
                    <div className={styles['stat-card']}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <div>
                            <p>Half Days</p>
                            <h3>{summary.halfDays}</h3>
                        </div>
                    </div>
                    <div className={styles['stat-card']}>
                        <FontAwesomeIcon icon={faCheck} />
                        <div>
                            <p>Present Days</p>
                            <h3>{summary.presentDays}</h3>
                        </div>
                    </div>
                    <div className={styles['stat-card']}>
                        <FontAwesomeIcon icon={faTimes} />
                        <div>
                            <p>Absent Days</p>
                            <h3>{summary.absentDays}</h3>
                        </div>
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
