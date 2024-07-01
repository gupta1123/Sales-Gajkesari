import React from 'react';
import './employeeCard.css';
import CustomCalendar from './CustomCalendar';

interface EmployeeCardProps {
    employee: {
        id: number;
        firstName: string;
        lastName: string;
        employeeId: string;
        department: string;
        position: string;
    };
    summary: {
        fullDays: number;
        halfDays: number;
        presentDays: number;
        absentDays: number;
    };
    month: number;
    year: number;
    attendanceData: {
        id: number; // Added id property
        employeeId: number;
        attendanceStatus: 'full day' | 'half day' | 'Absent'; // Removed 'Present' to match the expected type
        checkinDate: string;
        checkoutDate: string;
    }[];
    onDateClick: (id: number) => void; // Updated to match the expected type
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, summary, month, year, attendanceData, onDateClick }) => {
    return (
        <div className="employee-card">
            <div className="employee-info">
                <h2>{employee.firstName} {employee.lastName}</h2>
                <div className="employee-stats">
                    <div className="stat-card">
                        <i className="fas fa-calendar-day"></i>
                        <div>
                            <p>Full</p>
                            <h3>{summary.fullDays}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-calendar-alt"></i>
                        <div>
                            <p>Half</p>
                            <h3>{summary.halfDays}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-check"></i>
                        <div>
                            <p>Present</p>
                            <h3>{summary.presentDays}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-times"></i>
                        <div>
                            <p>Absent</p>
                            <h3>{summary.absentDays}</h3>
                        </div>
                    </div>
                </div>
                <div className="employee-calendar">
                    <CustomCalendar
                        month={month}
                        year={year}
                        attendanceData={attendanceData.filter(data => data.employeeId === employee.id)}
                        onDateClick={onDateClick} // Pass the onDateClick prop
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;
