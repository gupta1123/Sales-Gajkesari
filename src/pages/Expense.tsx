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
import { DownloadIcon } from '@radix-ui/react-icons';
import { utils, writeFile } from 'xlsx';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        fetchExpenseData();
    }, []);

    const fetchExpenseData = async () => {
        try {
            const response = await fetch('http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/expense/getAll', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setExpenseData(data);
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

    const handleApprove = async (expenseId: string) => {
        try {
            const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/expense/updateApproval?id=${expenseId}`, {
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
            const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/expense/reject?id=${expenseId}`, {
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
        if (selectedStatus && expense.approvalStatus !== selectedStatus) {
            return false;
        }
        if (selectedFieldOfficer && expense.employeeName !== selectedFieldOfficer) {
            return false;
        }
        return true;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Expense</h1>
                <div className="flex items-center space-x-4">
                    <Select onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
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
                            <SelectItem value="all">All</SelectItem>
                            {/* Add more field officer options based on the fetched data */}
                        </SelectContent>
                    </Select>

                  
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Field Officer Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Expense Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredExpenseData.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell>{expense.employeeName}</TableCell>
                            <TableCell>{expense.expenseDate}</TableCell>
                            <TableCell>{expense.type}</TableCell>
                            <TableCell>{expense.amount}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>{expense.approvalStatus}</TableCell>
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
        </div>
    );
};

export default ExpensePage;