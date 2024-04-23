import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ChangeFieldOfficerDialog from './ChangeFieldOfficerDialog';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FiPhone, FiUser, FiDollarSign, FiTarget, FiBriefcase } from "react-icons/fi";
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import Link from 'next/link';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddCustomerModal from './AddCustomerModal';
import { AiFillCaretDown } from "react-icons/ai";
import { useSelector } from 'react-redux';
import { RootState } from '../store';


type Customer = {
    storeId: string;
    storeName: string;
    clientFirstName: string;
    primaryContact: string;
    monthlySale: number;
    intentLevel: number;
    intent: number;
    employeeName: string;
    clientType: string;
    totalVisitCount: number;
    lastVisitDate: string;
    totalVisits: number;
    email: string;
    city: string;
    state: string;
};

type CustomerTableProps = {
    customers: Customer[];
    selectedColumns: string[];
    onSelectColumn: (column: string) => void;
    onSelectAllRows: () => void;
    selectedRows: string[];
    onSelectRow: (customerId: string) => void;
    onBulkAction: (action: string) => void;
    onDeleteCustomer: (customerId: string) => void;
};

const CustomerTable = ({
    customers,
    selectedColumns,
    onSelectColumn,
    onBulkAction,
    onDeleteCustomer,
}: CustomerTableProps) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedCustomers = sortColumn
        ? customers.slice().sort((a, b) => {
            const sortValue = (value: any) =>
                typeof value === 'string' ? value.toLowerCase() : value;

            const aValue = sortValue(a[sortColumn as keyof Customer]);
            const bValue = sortValue(b[sortColumn as keyof Customer]);

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        })
        : customers;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {selectedColumns.includes('shopName') && (
                        <TableHead
                            className="min-w-[200px] cursor-pointer"
                            onClick={() => handleSort('storeName')}
                        >
                            Shop Name
                            {sortColumn === 'storeName' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('ownerName') && (
                        <TableHead
                            className="min-w-[200px] cursor-pointer"
                            onClick={() => handleSort('clientFirstName')}
                        >
                            Owner Name
                            {sortColumn === 'clientFirstName' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('phone') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('primaryContact')}
                        >
                            Phone
                            {sortColumn === 'primaryContact' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('monthlySales') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('monthlySale')}
                        >
                            Monthly Sales
                            {sortColumn === 'monthlySale' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('intentLevel') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('intent')}
                        >
                            Intent Level
                            {sortColumn === 'intent' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('fieldOfficer') && (
                        <TableHead
                            className="min-w-[200px] cursor-pointer"
                            onClick={() => handleSort('employeeName')}
                        >
                            Field Officer
                            {sortColumn === 'employeeName' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('clientType') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('clientType')}
                        >
                            Client Type
                            {sortColumn === 'clientType' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('totalVisits') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('totalVisits')}
                        >
                            Total Visits
                            {sortColumn === 'totalVisits' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('lastVisitDate') && (
                        <TableHead
                            className="min-w-[200px] cursor-pointer"
                            onClick={() => handleSort('lastVisitDate')}
                        >
                            Last Visit Date
                            {sortColumn === 'lastVisitDate' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('email') && (
                        <TableHead
                            className="min-w-[350px] cursor-pointer"
                            onClick={() => handleSort('email')}
                        >
                            Email
                            {sortColumn === 'email' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('city') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('city')}
                        >
                            City
                            {sortColumn === 'city' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    {selectedColumns.includes('state') && (
                        <TableHead
                            className="min-w-[150px] cursor-pointer"
                            onClick={() => handleSort('state')}
                        >
                            State
                            {sortColumn === 'state' && (
                                <span className="text-black text-sm">{sortDirection === 'asc' ? ' ⬆️' : ' ⬇️'}</span>
                            )}
                        </TableHead>
                    )}
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>


            <TableBody>
                {sortedCustomers.map((customer) => (
                    <TableRow key={customer.storeId}>
                        {selectedColumns.includes('shopName') && <TableCell className="w-64">{customer.storeName}</TableCell>}
                        {selectedColumns.includes('ownerName') && <TableCell className="w-64">{customer.clientFirstName}</TableCell>}
                        {selectedColumns.includes('phone') && <TableCell className="w-48">{customer.primaryContact}</TableCell>}
                        {selectedColumns.includes('monthlySales') && <TableCell className="w-48">{customer.monthlySale ? `₹${customer.monthlySale.toLocaleString()}` : ''}</TableCell>}
                        {selectedColumns.includes('intentLevel') && (
                            <TableCell className="w-48">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-black"
                                        style={{ width: `${(customer.intent / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </TableCell>
                        )}
                        {selectedColumns.includes('fieldOfficer') && <TableCell className="w-64">{customer.employeeName}</TableCell>}
                        {selectedColumns.includes('clientType') && (
                            <TableCell className="w-48">
                                <Badge variant="outline">{customer.clientType}</Badge>
                            </TableCell>
                        )}
                        {selectedColumns.includes('totalVisits') && <TableCell className="w-40">{customer.totalVisits}</TableCell>}
                        {selectedColumns.includes('lastVisitDate') && <TableCell className="w-56">{customer.lastVisitDate}</TableCell>}
                        {selectedColumns.includes('email') && <TableCell className="w-72">{customer.email}</TableCell>}
                        {selectedColumns.includes('city') && <TableCell className="w-48">{customer.city}</TableCell>}
                        {selectedColumns.includes('state') && <TableCell className="w-48">{customer.state}</TableCell>}
                        <TableCell className="w-40">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <AiFillCaretDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => window.location.href = `/CustomerDetailPage/${customer.storeId}`}>
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => onDeleteCustomer(customer.storeId)}>
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function CustomerListPage() {
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
        'shopName', 'ownerName', 'phone', 'monthlySales', 'intentLevel', 'fieldOfficer',
        'clientType', 'totalVisits', 'lastVisitDate', 'email', 'city', 'state',
    ]);
    const [filters, setFilters] = useState({
        city: '',
        name: '',
        owner: '',
        phone: '',
    });
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isChangeFieldOfficerDialogOpen, setIsChangeFieldOfficerDialogOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const token = useSelector((state: RootState) => state.auth.token);
    const employeeId = useSelector((state: RootState) => state.auth.employeeId);

    const openDeleteModal = (customerId: string) => {
        setSelectedCustomerId(customerId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSelectedCustomerId(null);
        setIsDeleteModalOpen(false);
    };

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: value,
        }));
    };

    const handleFilterClear = (filterName: keyof typeof filters) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: '',
        }));
    };

    const applyFilters = (customers: Customer[]) => {

        return customers.filter((customer) => {
            const { city, name, owner, phone } = filters;
            return (
                (customer.city?.toLowerCase() || '').includes(city.toLowerCase()) &&
                (customer.storeName?.toLowerCase() || '').includes(name.toLowerCase()) &&
                (customer.clientFirstName?.toLowerCase() || '').includes(owner.toLowerCase()) &&
                (customer.primaryContact?.toString() || '').includes(phone)
            );
        });
    };

    const filteredCustomers = applyFilters(customers);
    const paginatedData = filteredCustomers.slice(startIndex, endIndex);

    const handleDeleteConfirm = async () => {
        if (selectedCustomerId) {
            try {
                const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/store/deleteById?id=${selectedCustomerId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    // Remove the deleted customer from the state
                    setCustomers(customers.filter((customer) => customer.storeId !== selectedCustomerId));
                    closeDeleteModal();
                } else {
                    // Handle error case
                    console.error('Failed to delete customer');
                }
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };


    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/store/getAll', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Customer[] = await response.json();
                setCustomers(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching customers:', error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unknown error occurred');
                }
                setLoading(false);
            }
        };

        if (token) {
            fetchCustomers();
        }
    }, [token]);


    const toggleViewMode = () => {
        setViewMode((prevMode) => (prevMode === 'card' ? 'table' : 'card'));
    };

    const handleSelectColumn = (column: string) => {
        if (selectedColumns.includes(column)) {
            setSelectedColumns(selectedColumns.filter((col) => col !== column));
        } else {
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    const handleSelectAllRows = () => {
        if (selectedRows.length === customers.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(customers.map((customer) => customer.storeId));
        }
    };

    const handleSelectRow = (customerId: string) => {
        if (selectedRows.includes(customerId)) {
            setSelectedRows(selectedRows.filter((id) => id !== customerId));
        } else {
            setSelectedRows([...selectedRows, customerId]);
        }
    };

    const handleBulkAction = (action: string) => {
        if (action === 'changeFieldOfficer') {
            console.log('Opening Change Field Officer Dialog');
            setIsChangeFieldOfficerDialogOpen(true);
        } else {
            console.log(`Performing ${action} on selected rows:`, selectedRows);
            // Implement the logic for other bulk actions
        }
    };

    const handleChangeFieldOfficerConfirm = (selectedFieldOfficer: string) => {
        console.log('Changing field officer to:', selectedFieldOfficer);
        console.log('Selected rows:', selectedRows);
        // Implement the logic to update the field officer for the selected customers
        setIsChangeFieldOfficerDialogOpen(false);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        const newValue = parseInt(value, 10);
        if (!isNaN(newValue)) {
            setItemsPerPage(newValue);
            setCurrentPage(1);
        }
    };


    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Customer List</h1>
                <div className="flex items-center space-x-2">
                    {viewMode === 'table' && (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Columns</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {['shopName', 'ownerName', 'phone', 'monthlySales', 'intentLevel', 'fieldOfficer', 'clientType', 'totalVisits', 'lastVisitDate', 'email', 'city', 'state'].map(
                                        (column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column}
                                                checked={selectedColumns.includes(column)}
                                                onCheckedChange={() => handleSelectColumn(column)}
                                            >
                                                {column}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/*  <Button variant="outline">Bulk Actions</Button> */}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleBulkAction('changeFieldOfficer')}>
                                        Change Field Officer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                    {/* <Button variant="outline" onClick={openModal}>Add Customer</Button> */}
                    {/* <Button onClick={toggleViewMode}>
                        {viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
                    </Button> */}
                </div>
            </div>
            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={closeModal}
                token={token || ''}
                employeeId={employeeId ? Number(employeeId) : null}
            />

            {/* {viewMode === 'card' ? (
                <>
                    <div className="space-y-8">
                        {paginatedData.map((customer) => (
                            <Card key={customer.storeId} className="bg-gray-100 text-gray-800 shadow-md rounded-lg overflow-hidden">
                                <CardHeader className="bg-gray-200 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-bold">{customer.storeName}</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="border-gray-500 text-gray-500">
                                                {customer.clientType}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-20 p-0">
                                                        <span className="flex items-center">
                                                            Actions <AiFillCaretDown className="h-4 w-4 ml-2" />
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Link href={`/CustomerDetailPage/${customer.storeId}`}>
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => openDeleteModal(customer.storeId)}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <Avatar className="mr-4 bg-gray-300 text-gray-600">
                                                    <AvatarFallback><FiUser /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-lg font-semibold">{customer.clientFirstName}</p>
                                                    <p className="text-gray-600 flex items-center">
                                                        <FiPhone className="mr-2" /> {customer.primaryContact}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold">Monthly Sales:</span>
                                                <span className="ml-2">₹{customer.monthlySale ? customer.monthlySale.toLocaleString() : ''}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold">Field Officer:</span>
                                                <span className="ml-2">{customer.employeeName}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-lg font-semibold mb-2">Intent Level</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-black"
                                                        style={{ width: `${(customer.intent / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-200 rounded-lg p-4">
                                                    <p className="text-lg font-semibold">Total Visits</p>
                                                    <p className="text-3xl font-bold">{customer.totalVisitCount}</p>
                                                </div>
                                                <div className="bg-gray-200 rounded-lg p-4">
                                                    <p className="text-lg font-semibold">Last Visit</p>
                                                    <p className="text-xl font-bold">{customer.lastVisitDate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-between items-center">
                        <div>
                            {Array.from({ length: Math.ceil(customers.length / itemsPerPage) }, (_, index) => (
                                <button
                                    key={index}
                                    className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Items per page:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-20">
                                    <SelectValue placeholder={itemsPerPage.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </>
            ) : (*/}
            <> <div className="mb-4 flex space-x-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filter by city"
                        className="border border-gray-300 rounded-md px-4 py-2 pr-10"
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                    />
                    {filters.city && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleFilterClear('city')}
                        >
                            &times;
                        </button>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filter by  Shop name"
                        className="border border-gray-300 rounded-md px-4 py-2 pr-10"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                    />
                    {filters.name && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleFilterClear('name')}
                        >
                            &times;
                        </button>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filter by owner"
                        className="border border-gray-300 rounded-md px-4 py-2 pr-10"
                        value={filters.owner}
                        onChange={(e) => handleFilterChange('owner', e.target.value)}
                    />
                    {filters.owner && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleFilterClear('owner')}
                        >
                            &times;
                        </button>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filter by phone number"
                        className="border border-gray-300 rounded-md px-4 py-2 pr-10"
                        value={filters.phone}
                        onChange={(e) => handleFilterChange('phone', e.target.value)}
                    />
                    {filters.phone && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleFilterClear('phone')}
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

                <CustomerTable
                    customers={paginatedData}
                    selectedColumns={selectedColumns}
                    onSelectColumn={handleSelectColumn}
                    onSelectAllRows={handleSelectAllRows}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                    onBulkAction={handleBulkAction}
                    onDeleteCustomer={openDeleteModal}
                />

                <div className="mt-8 flex justify-between items-center">
                    <div>
                        {Array.from({ length: Math.ceil(customers.length / itemsPerPage) }, (_, index) => (
                            <button
                                key={index}
                                className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>Items per page:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder={itemsPerPage.toString()} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </>


            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
            />
            <ChangeFieldOfficerDialog
                isOpen={isChangeFieldOfficerDialogOpen}
                onClose={() => setIsChangeFieldOfficerDialogOpen(false)}
                onConfirm={handleChangeFieldOfficerConfirm}
            />
        </div>
    );
} 