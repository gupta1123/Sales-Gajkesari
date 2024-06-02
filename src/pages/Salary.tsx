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
} from "@/components/ui/pagination";
import styles from './Salary.module.css';

const Salary: React.FC<{ authToken: string | null }> = ({ authToken }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript

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
                const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange?start=${selectedYear}-${selectedMonth}-01&end=${selectedYear}-${selectedMonth}-31`, {
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
                                <TableHead>Full Days</TableHead>
                                <TableHead>Half Days</TableHead>
                                <TableHead>Total Days</TableHead>
                                <TableHead>TA</TableHead>
                                <TableHead>DA</TableHead>
                                <TableHead>Total Salary</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.employeeFirstName} {row.employeeLastName}</TableCell>
                                    <TableCell>{row.statsDto.fullDays}</TableCell>
                                    <TableCell>{row.statsDto.halfDays}</TableCell>
                                    <TableCell>{row.statsDto.fullDays + row.statsDto.halfDays}</TableCell>
                                    <TableCell>{row.travelAllowance}</TableCell>
                                    <TableCell>{row.dearnessAllowance}</TableCell>
                                    <TableCell>{(row.fullMonthSalary / 25).toFixed(2)}</TableCell>
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
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
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