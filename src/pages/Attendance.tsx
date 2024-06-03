'use client'

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

interface Employee {
    id: number
    firstName: string
    lastName: string
    employeeId: string
    fullMonthSalary: number
    travelAllowance: number
    dearnessAllowance: number
    // Other properties...
}

interface AttendanceData {
    employeeId: number;
    employeeFirstName: string;
    employeeLastName: string;
    fullDays: number;
    halfDays: number;
    salary: number;
    expenseTotal: number;
    travelAllowance: number;
    dearnessAllowance: number;
    baseSalary: number;
    totalSalary: number;
}

const Attendance: React.FC = () => {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [attendanceData, setAttendanceData] = React.useState<AttendanceData[]>([]);
    const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [rowsPerPage] = React.useState<number>(10);
    const [noDataMessage, setNoDataMessage] = React.useState<string>("");

    const [sortColumn, setSortColumn] = React.useState<string>('employeeFirstName');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

    const years = Array.from({ length: 27 }, (_, index) => 2024 + index);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const workingDaysInMonth = [27, 24, 26, 26, 27, 26, 26, 27, 25, 26, 26, 27]; // Assuming fixed number of working days for each month

    const token = useSelector((state: RootState) => state.auth.token);

    React.useEffect(() => {
        fetchEmployees();
    }, [token]);

    React.useEffect(() => {
        fetchAttendanceData();
    }, [selectedYear, selectedMonth, token]);

    const fetchEmployees = async () => {
        if (!token) {
            console.error("Auth token is missing");
            return;
        }

        try {
            const response = await fetch("http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getAll", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch employees");
            }

            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchAttendanceData = async () => {
        if (!token) {
            console.error("Auth token is missing");
            return;
        }

        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
        const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

        try {
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange?start=${startDate}&end=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch attendance data");
            }

            const data = await response.json();
            setAttendanceData(data);
            setNoDataMessage("");

            if (data.length === 0) {
                setNoDataMessage("No data available for the selected month and year. Please choose a different month or year.");
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setAttendanceData([]);
            setNoDataMessage("No data available for the selected month and year. Please choose a different month or year.");
        }
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : "";
    };

    const getEmployeeTravelAllowance = (employeeId: number) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        return employee?.travelAllowance || 0;
    };

    const getEmployeeDearnessAllowance = (employeeId: number) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        return employee?.dearnessAllowance || 0;
    };

    const calculateTotalDays = (fullDays: number, halfDays: number) => {
        return (fullDays * 1) + (halfDays * 0.5);
    };

    const calculateBaseSalary = (employeeId: number, fullDays: number, halfDays: number) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        const fullMonthSalary = employee?.fullMonthSalary || 0;
        const totalDays = calculateTotalDays(fullDays, halfDays);
        return (fullMonthSalary / workingDaysInMonth[selectedMonth]) * totalDays;
    };

    const calculateTotalSalary = (employeeId: number, fullDays: number, halfDays: number, expenseTotal: number) => {
        const baseSalary = calculateBaseSalary(employeeId, fullDays, halfDays);
        const travelAllowance = getEmployeeTravelAllowance(employeeId) * (fullDays + halfDays);
        const dearnessAllowance = getEmployeeDearnessAllowance(employeeId) * (fullDays + halfDays);
        return baseSalary + travelAllowance + dearnessAllowance + expenseTotal;
    };

    const sortedAttendanceData = React.useMemo(() => {
        return [...attendanceData].map((data) => ({
            ...data,
            travelAllowance: getEmployeeTravelAllowance(data.employeeId) * (data.fullDays + data.halfDays),
            dearnessAllowance: getEmployeeDearnessAllowance(data.employeeId) * (data.fullDays + data.halfDays),
            baseSalary: calculateBaseSalary(data.employeeId, data.fullDays, data.halfDays),
            totalSalary: calculateTotalSalary(data.employeeId, data.fullDays, data.halfDays, data.expenseTotal),
        })).sort((a, b) => {
            if (sortColumn) {
                const aValue = a[sortColumn as keyof AttendanceData];
                const bValue = b[sortColumn as keyof AttendanceData];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }
            }
            return 0;
        });
    }, [attendanceData, sortColumn, sortDirection]);

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedAttendanceData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(attendanceData.length / rowsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                        Attendance Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center space-x-4">
                        <div>
                            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month, index) => (
                                        <SelectItem key={month} value={index.toString()}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {noDataMessage && (
                        <p className="mb-4 text-red-500">{noDataMessage}</p>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => handleSort('employeeFirstName')} className="cursor-pointer">
                                    Employee
                                    {sortColumn === 'employeeFirstName' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('fullDays')} className="cursor-pointer">
                                    Full Days
                                    {sortColumn === 'fullDays' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('halfDays')} className="cursor-pointer">
                                    Half Days
                                    {sortColumn === 'halfDays' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('baseSalary')} className="cursor-pointer">
                                    Base Salary
                                    {sortColumn === 'baseSalary' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('travelAllowance')} className="cursor-pointer">
                                    TA
                                    {sortColumn === 'travelAllowance' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('dearnessAllowance')} className="cursor-pointer">
                                    DA
                                    {sortColumn === 'dearnessAllowance' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('expenseTotal')} className="cursor-pointer">
                                    Expense
                                    {sortColumn === 'expenseTotal' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('totalSalary')} className="cursor-pointer">
                                    Total Salary
                                    {sortColumn === 'totalSalary' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.map((data) => (
                                <TableRow key={data.employeeId}>
                                    <TableCell>{getEmployeeName(data.employeeId)}</TableCell>
                                    <TableCell>{data.fullDays}</TableCell>
                                    <TableCell>{data.halfDays}</TableCell>
                                    <TableCell>{data.baseSalary.toFixed(2)}</TableCell>
                                    <TableCell>{data.travelAllowance}</TableCell>
                                    <TableCell>{data.dearnessAllowance}</TableCell>
                                    <TableCell>{data.expenseTotal}</TableCell>
                                    <TableCell>{data.totalSalary.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                                </PaginationItem>
                            )}
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </CardContent>
            </Card>
        </div>
    );
};

export default Attendance;