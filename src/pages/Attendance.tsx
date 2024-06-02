"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"

interface Employee {
    id: number
    firstName: string
    lastName: string
    employeeId: string
    // Other properties...
}

interface AttendanceData {
    employeeId: number
    employeeFirstName: string
    employeeLastName: string
    fullDays: number
    halfDays: number
    travelAllowance: number
    dearnessAllowance: number
    salary: number
}

const Attendance: React.FC = () => {
    const [employees, setEmployees] = React.useState<Employee[]>([])
    const [attendanceData, setAttendanceData] = React.useState<AttendanceData[]>([])
    const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth())
    const [currentPage, setCurrentPage] = React.useState<number>(1)
    const [rowsPerPage] = React.useState<number>(10)
    const [noDataMessage, setNoDataMessage] = React.useState<string>("")

    const years = Array.from({ length: 27 }, (_, index) => 2024 + index)
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const token = useSelector((state: RootState) => state.auth.token);

    React.useEffect(() => {
        fetchEmployees()
    }, [token])

    React.useEffect(() => {
        fetchAttendanceData()
    }, [selectedYear, selectedMonth, token])

    const fetchEmployees = async () => {
        if (!token) {
            console.error("Auth token is missing")
            return
        }

        try {
            const response = await fetch("http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getAll", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch employees")
            }

            const data = await response.json()
            setEmployees(data)
        } catch (error) {
            console.error("Error fetching employees:", error)
        }
    }

    const fetchAttendanceData = async () => {
        if (!token) {
            console.error("Auth token is missing")
            return
        }

        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0]
        const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0]

        try {
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/attendance-log/getForRange?start=${startDate}&end=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch attendance data")
            }

            const data = await response.json()
            setAttendanceData(data)
            setNoDataMessage("")

            if (data.length === 0) {
                setNoDataMessage("No data available for the selected month and year. Please choose a different month or year.")
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error)
            setAttendanceData([])
            setNoDataMessage("No data available for the selected month and year. Please choose a different month or year.")
        }
    }

    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((emp) => emp.id === employeeId)
        return employee ? `${employee.firstName} ${employee.lastName}` : ""
    }

    const calculateTotalDays = (fullDays: number, halfDays: number) => {
        return fullDays + halfDays / 2
    }

    const calculateTotalSalary = (salary: number, travelAllowance: number, dearnessAllowance: number) => {
        return salary + travelAllowance + dearnessAllowance
    }

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage
    const indexOfFirstRow = indexOfLastRow - rowsPerPage
    const currentRows = attendanceData.slice(indexOfFirstRow, indexOfLastRow)
    const totalPages = Math.ceil(attendanceData.length / rowsPerPage)

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    return (
        <div>
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
                    {currentRows.map((data) => (
                        <TableRow key={data.employeeId}>
                            <TableCell>{getEmployeeName(data.employeeId)}</TableCell>
                            <TableCell>{data.fullDays}</TableCell>
                            <TableCell>{data.halfDays}</TableCell>
                            <TableCell>{calculateTotalDays(data.fullDays, data.halfDays)}</TableCell>
                            <TableCell>{data.travelAllowance}</TableCell>
                            <TableCell>{data.dearnessAllowance}</TableCell>
                            <TableCell>{calculateTotalSalary(data.salary, data.travelAllowance, data.dearnessAllowance)}</TableCell>
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
        </div>
    )
}


export default Attendance