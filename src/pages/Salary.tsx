"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import styles from './Salary.module.css';

const Salary: React.FC<{ authToken: string | null }> = ({ authToken }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
    const [data, setData] = useState<any[]>([]);
    const [isDataAvailable, setIsDataAvailable] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const rowsPerPage = 10;

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const years = Array.from({ length: 2050 - currentYear + 1 }, (_, index) => {
        const year = currentYear + index;
        return { value: year.toString(), label: year.toString() };
    });

    const fetchData = useCallback(async () => {
        try {
            if (selectedYear && selectedMonth) {
                const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange1?start=2024-03-01&end=2024-05-31`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
                const attendanceLogs = await response.json();

                const employeeResponse = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getAll`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
                const employees = await employeeResponse.json();

                const mergedData = attendanceLogs.map((log: any) => {
                    const employee = employees.find((emp: any) => emp.id === log.employeeId);
                    return {
                        ...log,
                        travelAllowance: employee?.travelAllowance || 0,
                        dearnessAllowance: employee?.dearnessAllowance || 0,
                        fullMonthSalary: employee?.fullMonthSalary || 0,
                    };
                });

                setData(mergedData);
                setIsDataAvailable(mergedData.length > 0);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsDataAvailable(false);
        }
    }, [selectedYear, selectedMonth, authToken]);

    useEffect(() => {
        if (selectedYear && selectedMonth) {
            fetchData();
        }
    }, [selectedYear, selectedMonth, fetchData]);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    const renderPaginationItems = () => {
        const maxVisiblePages = 5;
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfVisiblePages);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const paginationItems = [];

        if (startPage > 1) {
            paginationItems.push(
                <PaginationItem key="start">
                    <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) {
                paginationItems.push(<PaginationEllipsis key="startEllipsis" />);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationItems.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={currentPage === i}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationItems.push(<PaginationEllipsis key="endEllipsis" />);
            }
            paginationItems.push(
                <PaginationItem key="end">
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return paginationItems;
    };

    return (
        <div className={styles.salaryContainer}>
            <h2>Salary Details</h2>
            <div className={styles.filterContainer}>
                <div className={styles.selectContainer}>
                    <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className={styles.selectContainer}>
                    <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(month => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {isDataAvailable ? (
                <>
                    <Table className={styles.table}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Attendance Status</TableHead>
                                <TableHead>Visit Count</TableHead>
                                <TableHead>Check-in Date</TableHead>
                                <TableHead>Check-out Date</TableHead>
                                <TableHead>Check-in Time</TableHead>
                                <TableHead>Check-out Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.employeeName}</TableCell>
                                    <TableCell>{row.attendanceStatus}</TableCell>
                                    <TableCell>{row.visitCount}</TableCell>
                                    <TableCell>{row.checkinDate}</TableCell>
                                    <TableCell>{row.checkoutDate}</TableCell>
                                    <TableCell>{row.checkinTime}</TableCell>
                                    <TableCell>{row.checkoutTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                                </PaginationItem>
                            )}
                            {renderPaginationItems()}
                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </>
            ) : (
                <p className={styles.noDataMessage}>No data available for the selected month and year. Please choose a different month or year.</p>
            )}
        </div>
    );
};

export default Salary;