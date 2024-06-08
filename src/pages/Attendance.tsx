import React from "react";
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
    employeeName: string;
    attendanceStatus: string;
    visitCount: number;
    uniqueStoreCount: number | null;
    travelAllowance: number | null;
    dearnessAllowance: number | null;
    checkinDate: string;
    checkoutDate: string;
    checkinTime: string;
    checkoutTime: string;
    fullMonthSalary: number | null;
}

const Attendance: React.FC = () => {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [attendanceData, setAttendanceData] = React.useState<AttendanceData[]>([]);
    const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const rowsPerPage = 10; // Set rows per page to 10
    const [noDataMessage, setNoDataMessage] = React.useState<string>("");

    const [sortColumn, setSortColumn] = React.useState<string>('employeeName');
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
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange1?start=${startDate}&end=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch attendance data");
            }

            const data = await response.json();
            setAttendanceData(data);

            if (data.length === 0) {
                setNoDataMessage("No data available for the selected month and year. Please choose a different month or year.");
            } else {
                setNoDataMessage("");
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
            travelAllowance: getEmployeeTravelAllowance(data.employeeId) * (data.visitCount),
            dearnessAllowance: getEmployeeDearnessAllowance(data.employeeId) * (data.visitCount),
            baseSalary: calculateBaseSalary(data.employeeId, data.visitCount, 0),
            totalSalary: calculateTotalSalary(data.employeeId, data.visitCount, 0, 0),
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
    const totalPages = Math.ceil(sortedAttendanceData.length / rowsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPaginationItems = () => {
        const paginationItems: JSX.Element[] = [];

        if (totalPages <= 1) return paginationItems;

        const ellipsis = <span key="ellipsis" className="mx-1">...</span>;

        const addPageItem = (pageNumber: number) => {
            paginationItems.push(
                <PaginationItem key={pageNumber}>
                    <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                    >
                        {pageNumber}
                    </PaginationLink>
                </PaginationItem>
            );
        };

        if (currentPage > 1) {
            paginationItems.push(
                <PaginationItem key="prev">
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                </PaginationItem>
            );
        }

        addPageItem(1);
        if (totalPages > 1) addPageItem(2);
        if (totalPages > 2) addPageItem(3);

        if (currentPage > 4) {
            paginationItems.push(ellipsis);
        }

        if (currentPage > 3 && currentPage < totalPages - 2) {
            addPageItem(currentPage - 1);
            addPageItem(currentPage);
            addPageItem(currentPage + 1);
        } else if (currentPage <= 4) {
            for (let i = 4; i < Math.min(totalPages - 1, 6); i++) {
                addPageItem(i);
            }
        }

        if (currentPage < totalPages - 3) {
            paginationItems.push(ellipsis);
        }

        if (totalPages > 2) addPageItem(totalPages - 1);
        if (totalPages > 1) addPageItem(totalPages);

        if (currentPage < totalPages) {
            paginationItems.push(
                <PaginationItem key="next">
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                </PaginationItem>
            );
        }

        return paginationItems;
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
                            <Select value={selectedYear.toString()} onValueChange={(value) => {
                                setSelectedYear(parseInt(value));
                                setCurrentPage(1); // Reset to first page when year changes
                            }}>
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
                            <Select value={selectedMonth.toString()} onValueChange={(value) => {
                                setSelectedMonth(parseInt(value));
                                setCurrentPage(1); // Reset to first page when month changes
                            }}>
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
                    {noDataMessage ? (
                        <p className="mb-4 text-red-500">{noDataMessage}</p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead onClick={() => handleSort('employeeName')} className="cursor-pointer">
                                            Employee
                                            {sortColumn === 'employeeName' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                        </TableHead>
                                        <TableHead onClick={() => handleSort('visitCount')} className="cursor-pointer">
                                            Visit Count
                                            {sortColumn === 'visitCount' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
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
                                        <TableHead onClick={() => handleSort('totalSalary')} className="cursor-pointer">
                                            Total Salary
                                            {sortColumn === 'totalSalary' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentRows.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{data.employeeName}</TableCell>
                                            <TableCell>{data.visitCount}</TableCell>
                                            <TableCell>{data.baseSalary.toFixed(2)}</TableCell>
                                            <TableCell>{data.travelAllowance}</TableCell>
                                            <TableCell>{data.dearnessAllowance}</TableCell>
                                            <TableCell>{data.totalSalary.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination>
                                <PaginationContent>
                                    {renderPaginationItems()}
                                </PaginationContent>
                            </Pagination>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Attendance;
