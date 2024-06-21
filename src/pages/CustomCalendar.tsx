import React, { useEffect, useRef } from 'react';
import './CustomCalendar.css';

interface CustomCalendarProps {
    month: number;
    year: number;
    attendanceData: {
        employeeId: number;
        attendanceStatus: 'full day' | 'half day' | 'Present' | 'Absent';
        checkinDate: string;
        checkoutDate: string;
    }[];
    onDateClick: (date: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ month, year, attendanceData, onDateClick }) => {
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
                    const tooltip = document.createElement('span');
                    tooltip.classList.add('calendar-tooltip');

                    if (date.getDay() === 0) {
                        dateDiv.classList.add('sunday');
                        tooltip.textContent = 'Holiday';
                    } else if (attendanceStatus) {
                        dateDiv.classList.add(attendanceStatus.toLowerCase().replace(' ', '-'));
                        tooltip.textContent = ` ${attendanceStatus}`;
                    }

                    dateDiv.appendChild(tooltip);

                    dateDiv.addEventListener('mouseover', () => {
                        const rect = dateDiv.getBoundingClientRect();
                        const tooltipRect = tooltip.getBoundingClientRect();

                        if (rect.right - tooltipRect.width / 2 < 0) {
                            tooltip.style.left = '0';
                            tooltip.style.transform = 'none';
                        } else if (rect.left + tooltipRect.width / 2 > datesRef.current!.offsetWidth) {
                            tooltip.style.left = 'auto';
                            tooltip.style.right = '0';
                            tooltip.style.transform = 'none';
                        } else {
                            tooltip.style.left = '50%';
                            tooltip.style.transform = 'translateX(-50%)';
                        }
                    });

                    dateDiv.addEventListener('click', () => {
                        onDateClick(dateKey);
                    });

                    datesRef.current?.appendChild(dateDiv);
                }
            }
        };

        renderCalendar();
    }, [month, year, attendanceData, onDateClick]);

    return (
        <div className="custom-calendar">
            <div className="calendar-days">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
            </div>
            <div className="calendar-dates" ref={datesRef}></div>
        </div>
    );
};

export default CustomCalendar;
