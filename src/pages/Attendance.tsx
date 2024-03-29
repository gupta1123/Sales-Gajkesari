import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from '@radix-ui/react-icons';
import { utils, writeFile } from 'xlsx';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Input } from '@/components/ui/input';
interface AttendanceRecord {
    id: number;
    employeeName: string;
    attendanceStatus: string;
    visitCount: number; // Add this line
    checkinDate: string; // Assuming dates are strings; adjust as necessary
    checkoutDate: string;
    checkinTime: string;
    checkoutTime: string;
    // Add any other properties that are used but not yet declared
}

interface DownloadExcelButtonProps {
    attendanceData: AttendanceRecord[];
}



const AttendancePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
   
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const startDate = selectedStartDate ? selectedStartDate.toISOString().split('T')[0] : '';
                const endDate = selectedEndDate ? selectedEndDate.toISOString().split('T')[0] : '';

                const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange?start=${startDate}&end=${endDate}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAttendanceData(data);
                } else {
                    console.error('Error fetching attendance data:', response.status);
                    // Handle the error case, e.g., show an error message to the user
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                // Handle the error case, e.g., show an error message to the user
            }
        };

        fetchAttendanceData();
    }, [selectedStartDate, selectedEndDate, token]);

    const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleStartDateChange = (date: Date | null) => {
        setSelectedStartDate(date);
    };

    const handleEndDateChange = (date: Date | null) => {
        setSelectedEndDate(date);
    };

    const filteredAttendanceData = attendanceData.filter((attendance) => {
        const fieldOfficerName = attendance.employeeName.toLowerCase();
        const searchTerm = searchQuery.toLowerCase();
        return fieldOfficerName.includes(searchTerm);
    });

    return (
        <div>
            <h1 className="text-3xl font-bold">Attendance</h1>

            <div className="mb-4 flex items-center">
                <div className="mr-4">
                    <Input
                        type="text"
                        placeholder="Search by Field Officer"
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                        className="w-[180px]"
                    />
                </div>

                <div className="mr-4">
                    <DatePicker.default
                        selected={selectedStartDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        placeholderText="Start Date"
                        className="w-[180px]"
                    />
                </div>

                <div className="mr-4">
                    <DatePicker.default
                        selected={selectedEndDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        minDate={selectedStartDate}
                        placeholderText="End Date"
                        className="w-[180px]"
                    />
                </div>

             
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Field Officer</TableHead>
                        <TableHead>Attendance Status</TableHead>
                        <TableHead>Visit Count</TableHead>
                        <TableHead>Check-in Date</TableHead>
                        <TableHead>Check-out Date</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Check-out Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendanceData.map((attendance) => (
                        <TableRow key={attendance.id}>
                            <TableCell>{attendance.employeeName}</TableCell>
                            <TableCell>{attendance.attendanceStatus}</TableCell>
                            <TableCell>{attendance.visitCount}</TableCell> {/* Now valid */}
                            <TableCell>{attendance.checkinDate}</TableCell>
                            <TableCell>{attendance.checkoutDate}</TableCell>
                            <TableCell>{attendance.checkinTime}</TableCell>
                            <TableCell>{attendance.checkoutTime}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AttendancePage;