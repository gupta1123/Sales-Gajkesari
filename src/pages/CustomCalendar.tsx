import React, { useEffect, useRef } from 'react';
import './CustomCalendar.css';

interface CustomCalendarProps {
    month: number;
    year: number;
    attendanceData: {
        employeeId: number;
        attendanceStatus: 'full day' | 'half day' | 'Present' | 'absent';
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

                    if (attendanceStatus) {
                        dateDiv.classList.add(attendanceStatus.replace(' ', '-'));
                        const tooltip = document.createElement('span');
                        tooltip.classList.add('calendar-tooltip');
                        tooltip.textContent = `Status: ${attendanceStatus}`;
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
