import React from 'react';
import './employeeCard.css';
import CustomCalendar from './CustomCalendar';

interface EmployeeCardProps {
    employee: {
        id: number;
        firstName: string;
        lastName: string;
        // Removed unused fields
    };
    summary: {
        fullDays: number;
        halfDays: number;
        absentDays: number;
    };
    month: number;
    year: number;
    attendanceData: {
        employeeId: number;
        attendanceStatus: 'full day' | 'half day' | 'Absent';
        checkinDate: string;
        checkoutDate: string;
    }[];
    onDateClick: (date: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, summary, month, year, attendanceData, onDateClick }) => {
    // Filter out any entries with "Present" in the attendanceStatus
    const filteredAttendanceData = attendanceData.filter(data =>
        data.attendanceStatus === 'full day' ||
        data.attendanceStatus === 'half day' ||
        data.attendanceStatus === 'Absent'
    );

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
                        <i className="fas fa-times"></i>
                        <div>
                            <p>Absent</p>
                            <h3>{summary.absentDays}</h3>
                        </div>
                    </div>
                </div>
                <div className="employee-calendar">
                    {/* <CustomCalendar
                        month={month}
                        year={year}
                        attendanceData={filteredAttendanceData.filter(data => data.employeeId === employee.id)}
                        onSummaryChange={() => { }} // Provide a dummy function or handle appropriately
                 */}
                    {/* /> */}
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;
