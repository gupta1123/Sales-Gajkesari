import React from 'react';
import './employeeCard.css';
import CustomCalendar from './CustomCalendar';

interface EmployeeCardProps {
    employee: {
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
        employeeId: number;  // Keep this as number
        attendanceStatus: 'full day' | 'half day' | 'Present' | 'absent';
        checkinDate: string;
        checkoutDate: string;
    }[];
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, summary, month, year, attendanceData }) => {
    return (
        <div className="employee-card">
            <div className="employee-info">
                <h2>{employee.firstName} {employee.lastName}</h2>
                <p><i className="fas fa-id-badge"></i> Employee ID: {employee.employeeId}</p>
                <p><i className="fas fa-building"></i> Department: {employee.department}</p>
                <p><i className="fas fa-briefcase"></i> Position: {employee.position}</p>
                <div className="employee-stats">
                    <div className="stat-card">
                        <i className="fas fa-calendar-day"></i>
                        <div>
                            <p>Full Days</p>
                            <h3>{summary.fullDays}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-calendar-alt"></i>
                        <div>
                            <p>Half Days</p>
                            <h3>{summary.halfDays}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-check"></i>
                        <div>
                            <p>Present Days</p>
                            <h3>{summary.presentDays}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-times"></i>
                        <div>
                            <p>Absent Days</p>
                            <h3>{summary.absentDays}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="employee-calendar">
                <CustomCalendar
                    month={month}
                    year={year}
                    attendanceData={attendanceData.filter(data => data.employeeId.toString() === employee.employeeId)}
                />
            </div>
        </div>
    );
};

export default EmployeeCard;
