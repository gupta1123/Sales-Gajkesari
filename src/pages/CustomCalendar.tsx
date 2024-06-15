import React, { useEffect, useRef } from 'react';
import './customCalendar.css';

interface CustomCalendarProps {
    month: number;
    year: number;
    attendanceData: {
        employeeId: number;
        attendanceStatus: 'full day' | 'half day' | 'Present' | 'Absent';
        checkinDate: string;
        checkoutDate: string;
    }[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ month, year, attendanceData }) => {
    const datesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderCalendar = () => {
            if (datesRef.current) {
                datesRef.current.innerHTML = '';
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                for (let i = 0; i < firstDay; i++) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.classList.add('empty');
                    datesRef.current?.appendChild(emptyDiv);
                }

                for (let i = 1; i <= daysInMonth; i++) {
                    const dateDiv = document.createElement('div');
                    dateDiv.textContent = i.toString();

                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const attendanceStatus = attendanceData.find(data => data.checkinDate.startsWith(dateKey))?.attendanceStatus;

                    const date = new Date(year, month, i);
                    if (date.getDay() === 0) {
                        dateDiv.classList.add('sunday');
                    } else if (attendanceStatus) {
                        dateDiv.classList.add(attendanceStatus.toLowerCase().replace(' ', '-'));
                        const tooltip = document.createElement('span');
                        tooltip.classList.add('calendar-tooltip');
                        tooltip.textContent = ` ${attendanceStatus}`;
                        dateDiv.appendChild(tooltip);
                    }

                    datesRef.current?.appendChild(dateDiv);
                }
            }
        };

        renderCalendar();
    }, [month, year, attendanceData]);

    return (
        <div className="custom-calendar">
            <div className="calendar-days">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="calendar-dates" ref={datesRef}></div>
        </div>
    );
};

export default CustomCalendar;