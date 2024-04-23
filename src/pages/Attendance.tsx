"use client"

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from '@radix-ui/react-icons';
import { utils, writeFile } from 'xlsx';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination';

interface AttendanceRecord {
    id: number;
    employeeName: string;
    attendanceStatus: string;
    visitCount: number;
    checkinDate: string;
    checkoutDate: string;
    checkinTime: string;
    checkoutTime: string;
}

const AttendancePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const startDate = selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : '';
                const endDate = selectedEndDate ? format(selectedEndDate, 'yyyy-MM-dd') : '';

                const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange?start=${startDate}&end=${endDate}`, {
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
        setCurrentPage(1); // Reset to the first page when the search query changes
    };

    const filteredAttendanceData = attendanceData.filter((attendance) => {
        const fieldOfficerName = attendance.employeeName.toLowerCase();
        const searchTerm = searchQuery.toLowerCase();
        return fieldOfficerName.includes(searchTerm);
    });

    const totalPages = Math.ceil(filteredAttendanceData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendanceData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center">
                        <div className="mr-4">
                            <Input
                                type="text"
                                placeholder="Search by Field Officer"
                                value={searchQuery}
                                onChange={handleSearchQueryChange}
                                className="w-[300px]"
                            />
                        </div>

                        <div className="mr-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        {selectedStartDate ? format(selectedStartDate, 'MMM d, yyyy') : 'Start Date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedStartDate}
                                        onSelect={setSelectedStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="mr-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        {selectedEndDate ? format(selectedEndDate, 'MMM d, yyyy') : 'End Date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedEndDate}
                                        onSelect={setSelectedEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
                            {currentItems.map((attendance) => (
                                <TableRow key={attendance.id}>
                                    <TableCell>{attendance.employeeName}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full font-semibold ${attendance.attendanceStatus === 'Present'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {attendance.attendanceStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>{attendance.visitCount}</TableCell>
                                    <TableCell>{attendance.checkinDate}</TableCell>
                                    <TableCell>{attendance.checkoutDate}</TableCell>
                                    <TableCell>{attendance.checkinTime}</TableCell>
                                    <TableCell>{attendance.checkoutTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination className="mt-4">
                        <PaginationContent>
                            {currentPage !== 1 && (
                                <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                            )}
                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            {totalPages > 5 && (
                                <>
                                    {currentPage < 4 && <PaginationEllipsis />}
                                    {currentPage > 3 && currentPage < totalPages - 2 && (
                                        <>
                                            <PaginationEllipsis />
                                            <PaginationItem>
                                                <PaginationLink
                                                    isActive={currentPage === currentPage}
                                                    onClick={() => setCurrentPage(currentPage)}
                                                >
                                                    {currentPage}
                                                </PaginationLink>
                                            </PaginationItem>
                                            <PaginationEllipsis />
                                        </>
                                    )}
                                    {currentPage > totalPages - 3 && <PaginationEllipsis />}
                                </>
                            )}
                            {currentPage !== totalPages && (
                                <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                            )}
                        </PaginationContent>
                    </Pagination>
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendancePage;