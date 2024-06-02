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
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import styles from './Allowance.module.css';

const Allowance: React.FC<{ authToken: string | null }> = ({ authToken }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editedData, setEditedData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const rowsPerPage = 10;

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getAll`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const result = await response.json();
            const employeesWithAllowances = result.map((employee: any) => ({
                ...employee,
                travelAllowance: employee.travelAllowance || 0,
                dearnessAllowance: employee.dearnessAllowance || 0,
                fullMonthSalary: employee.fullMonthSalary || 0,
            }));
            setEmployees(employeesWithAllowances);
            setEditedData(employeesWithAllowances);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }, [authToken]);

    const handleInputChange = (index: number, field: string, value: string) => {
        const updatedData = [...editedData];
        updatedData[index] = { ...updatedData[index], [field]: parseInt(value, 10) || 0 };
        setEditedData(updatedData);
    };

    const updateSalary = async (employee: any) => {
        try {
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/setSalary`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    travelAllowance: employee.travelAllowance,
                    dearnessAllowance: employee.dearnessAllowance,
                    fullMonthSalary: employee.fullMonthSalary,
                    employeeId: employee.id,
                }),
            });
            const result = await response.text();
            if (result === 'Salary Updated!') {
                fetchEmployees();
            } else {
                alert('Failed to update salary.');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Error saving changes.');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = employees.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(employees.length / rowsPerPage);

    return (
        <div className={styles.allowanceContainer}>
            <h2>Allowance Details</h2>
            <Table className={styles.table}>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>TA</TableHead>
                        <TableHead>DA</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentRows.map((employee, index) => (
                        <TableRow key={index}>
                            <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                            <TableCell>
                                {editMode ? (
                                    <input
                                        type="number"
                                        value={editedData[index].travelAllowance}
                                        onChange={(e) => handleInputChange(index, 'travelAllowance', e.target.value)}
                                    />
                                ) : (
                                    employee.travelAllowance
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <input
                                        type="number"
                                        value={editedData[index].dearnessAllowance}
                                        onChange={(e) => handleInputChange(index, 'dearnessAllowance', e.target.value)}
                                    />
                                ) : (
                                    employee.dearnessAllowance
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <input
                                        type="number"
                                        value={editedData[index].fullMonthSalary}
                                        onChange={(e) => handleInputChange(index, 'fullMonthSalary', e.target.value)}
                                    />
                                ) : (
                                    parseInt(employee.fullMonthSalary, 10)
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <Button variant="outline" size="sm" onClick={() => {
                                        setEditMode(false);
                                        updateSalary(editedData[index]);
                                    }}>Save</Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>Edit</Button>
                                )}
                            </TableCell>
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
    );
};

export default Allowance;