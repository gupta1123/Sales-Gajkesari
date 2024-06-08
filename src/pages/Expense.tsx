import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';

interface Expense {
    id: string;
    employeeName: string;
    expenseDate: string;
    type: string;
    amount: number;
    description: string;
    approvalStatus: string;
}

const ExpensePage = () => {
    const [expenseData, setExpenseData] = useState<Expense[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedFieldOfficer, setSelectedFieldOfficer] = useState('');
    const [selectedExpenseCategory, setSelectedExpenseCategory] = useState('');
    const [fieldOfficers, setFieldOfficers] = useState<string[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
    const token = useSelector((state: RootState) => state.auth.token);
    const [sortColumn, setSortColumn] = useState<string>('expenseDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    useEffect(() => {
        fetchExpenseData();
    }, []);

    const fetchExpenseData = async () => {
        try {
            const response = await fetch('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/expense/getAll', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setExpenseData(data);

            // Extract unique field officer names
            const officers = Array.from(new Set(data.map((expense: Expense) => expense.employeeName))) as string[];
            setFieldOfficers(officers);

            // Extract unique expense categories
            const categories = Array.from(new Set(data.map((expense: Expense) => expense.type))) as string[];
            setExpenseCategories(categories);
        } catch (error) {
            console.error('Error fetching expense data:', error);
        }
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
    };

    const handleFieldOfficerChange = (value: string) => {
        setSelectedFieldOfficer(value);
    };

    const handleExpenseCategoryChange = (value: string) => {
        setSelectedExpenseCategory(value);
    };

    const handleApprove = async (expenseId: string) => {
        try {
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/expense/updateApproval?id=${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    approvalStatus: 'Approved',
                    approvalDate: '2024-03-23',
                    reimbursedDate: '2023-03-23',
                    reimbursementAmount: 200,
                    paymentMethod: 'cash',
                }),
            });

            if (response.ok) {
                console.log('Expense approved successfully');
                fetchExpenseData(); // Refresh the expense data after approval
            } else {
                console.error('Error approving expense');
            }
        } catch (error) {
            console.error('Error approving expense:', error);
        }
    };

    const handleReject = async (expenseId: string) => {
        try {
            const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/expense/reject?id=${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    approvalStatus: 'Rejected',
                    approvalDate: '2024-03-22',
                    rejectionReason: 'Reason',
                }),
            });

            if (response.ok) {
                console.log('Expense rejected successfully');
                fetchExpenseData(); // Refresh the expense data after rejection
            } else {
                console.error('Error rejecting expense');
            }
        } catch (error) {
            console.error('Error rejecting expense:', error);
        }
    };

    const filteredExpenseData = expenseData.filter((expense) => {
        if (selectedStatus && selectedStatus !== 'all' && expense.approvalStatus !== selectedStatus) {
            return false;
        }
        if (selectedFieldOfficer && selectedFieldOfficer !== 'all' && expense.employeeName !== selectedFieldOfficer) {
            return false;
        }
        if (selectedExpenseCategory && selectedExpenseCategory !== 'all' && expense.type !== selectedExpenseCategory) {
            return false;
        }
        return true;
    });

    const sortedExpenseData = filteredExpenseData.sort((a, b) => {
        let aValue = a[sortColumn as keyof Expense];
        let bValue = b[sortColumn as keyof Expense];

        if (sortColumn === 'expenseDate') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedExpenseData = sortedExpenseData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                        Expense Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <Select onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select onValueChange={handleFieldOfficerChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Field Officer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Field Officers</SelectItem>
                                    {fieldOfficers.map((officer) => (
                                        <SelectItem key={officer} value={officer}>
                                            {officer}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select onValueChange={handleExpenseCategoryChange}>
                                <SelectTrigger className="w-[280px]"> {/* Increased width */}
                                    <SelectValue placeholder="Filter by Expense Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Expense Categories</SelectItem>
                                    {expenseCategories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => handleSort('employeeName')} className="cursor-pointer">
                                    Field Officer Name
                                    {sortColumn === 'employeeName' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead>
                                    Date
                                </TableHead>
                                <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                                    Expense Category
                                    {sortColumn === 'type' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('amount')} className="cursor-pointer">
                                    Amount
                                    {sortColumn === 'amount' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('description')} className="cursor-pointer">
                                    Description
                                    {sortColumn === 'description' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead onClick={() => handleSort('approvalStatus')} className="cursor-pointer">
                                    Status
                                    {sortColumn === 'approvalStatus' && (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                                </TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedExpenseData.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{expense.employeeName}</TableCell>
                                    <TableCell>{expense.expenseDate}</TableCell>
                                    <TableCell>{expense.type}</TableCell>
                                    <TableCell>{expense.amount}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full font-semibold ${expense.approvalStatus === 'Approved'
                                                ? 'bg-green-100 text-green-800'
                                                : expense.approvalStatus === 'Rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {expense.approvalStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">Actions</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => handleApprove(expense.id)}>
                                                    Approve
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleReject(expense.id)}>
                                                    Reject
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination className="mt-4">
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                        <PaginationContent>
                            {Array.from({ length: Math.ceil(filteredExpenseData.length / rowsPerPage) }, (_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        isActive={index + 1 === currentPage}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                    </Pagination>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpensePage;
