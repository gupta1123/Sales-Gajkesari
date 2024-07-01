import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import './Requirements.css';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
    id: number;
    taskTitle: string;
    taskDescription: string;
    dueDate: string;
    assignedToId: number;
    assignedToName: string;
    assignedById: number;
    status: string;
    priority: string;
    category: string;
    storeId: number;
    storeName: string;
    storeCity: string;
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
}

interface Store {
    id: number;
    storeName: string;
}

const Requirements = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<Task>({
        id: 0,
        taskTitle: '',
        taskDescription: '',
        dueDate: '',
        assignedToId: 0,
        assignedToName: '',
        assignedById: 86,
        status: 'Assigned',
        priority: 'low',
        category: 'Birthday',
        storeId: 0,
        storeName: '',
        storeCity: '',
    });
    const router = useRouter();
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState('general');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filters, setFilters] = useState({ employee: '', priority: '', status: '', search: '' });
    const token = useSelector((state: RootState) => state.auth.token);
    const role = useSelector((state: RootState) => state.auth.role);
    const employeeId = useSelector((state: RootState) => state.auth.employeeId);
    const teamId = useSelector((state: RootState) => state.auth.teamId); // Assuming teamId is stored in the auth state
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [stores, setStores] = useState<Store[]>([]);

    useEffect(() => {
        fetchTasks();
    }, [token, currentPage, itemsPerPage, sortColumn, sortDirection, filters]);

    useEffect(() => {
        if (isModalOpen || isEditModalOpen) {
            fetchEmployees();
            fetchStores();
        }
    }, [isModalOpen, isEditModalOpen, token]);

    const handleNext = () => {
        setActiveTab('details');
    };

    const handleBack = () => {
        setActiveTab('general');
    };

    const handleViewStore = (storeId: number) => {
        router.push(`/CustomerDetailPage/${storeId}`);
    };

    const handleViewFieldOfficer = (employeeId: number) => {
        router.push(`/SalesExecutive/${employeeId}`);
    };

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            let apiUrl = `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/task/getAll?page=${currentPage - 1}&size=${itemsPerPage}&sort=${sortColumn},${sortDirection}`;

            if (role === 'MANAGER') {
                apiUrl = `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/task/getByTeam?id=${teamId}`;
            }

            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            const filteredTasks = data.content
                .filter((task: any) => task.taskType === 'requirement')
                .map((task: any) => ({
                    ...task,
                    taskDescription: task.taskDesciption, // Map taskDesciption to taskDescription
                    assignedToName: task.assignedToName || 'Unknown',
                }));

            setTasks(filteredTasks);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getAll', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await fetch('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/store/names', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setStores(data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const createTask = async () => {
        try {
            const taskToCreate = {
                taskTitle: newTask.taskTitle,
                taskDesciption: newTask.taskDescription,
                dueDate: newTask.dueDate,
                assignedToId: newTask.assignedToId,
                assignedById: newTask.assignedById,
                status: newTask.status,
                priority: newTask.priority,
                taskType: 'requirement', // Ensure taskType is set to 'requirement'
                storeId: newTask.storeId,
            };

            const response = await fetch('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/task/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(taskToCreate),
            });
            const data = await response.json();

            const createdTask = {
                ...newTask,
                id: data.id,
                assignedToName: employees.find(emp => emp.id === newTask.assignedToId)?.firstName + ' ' + employees.find(emp => emp.id === newTask.assignedToId)?.lastName || 'Unknown',
                storeName: stores.find(store => store.id === newTask.storeId)?.storeName || '',
            };

            setTasks(prevTasks => [createdTask, ...prevTasks]);

            setNewTask({
                id: 0,
                taskTitle: '',
                taskDescription: '',
                dueDate: '',
                assignedToId: 0,
                assignedToName: '',
                assignedById: 86,
                status: 'Assigned',
                priority: 'low',
                category: 'Birthday',
                storeId: 0,
                storeName: '',
                storeCity: '',
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const updateTask = async () => {
        if (!editTask) {
            console.error('editTask is null');
            return;
        }

        try {
            const response = await fetch(
                `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/task/updateTask?taskId=${editTask.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...editTask, taskType: 'requirement' }), // Ensure taskType is set to 'requirement'
                }
            );

            const data = await response.json();

            setTasks((prevTasks) => {
                const updatedTasks = prevTasks.map((task) => {
                    if (task.id === editTask.id) {
                        return { ...editTask, taskType: 'requirement' };
                    }
                    return task;
                });
                return updatedTasks;
            });

            setEditTask(null);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/task/deleteById?taskId=${taskId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleSort = (column: string) => {
        if (column === sortColumn) {
            setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
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

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    const renderTag = (value: string | null | undefined, type: string) => {
        if (!value) {
            return null;
        }

        let className = 'tag ';
        switch (value.toLowerCase()) {
            case 'assigned':
                className += 'tag-blue';
                break;
            case 'in progress':
                className += 'tag-yellow';
                break;
            case 'completed':
                className += 'tag-green';
                break;
            case 'closed':
                className += 'tag-gray';
                break;
            case 'low':
                className += 'tag-green';
                break;
            case 'medium':
                className += 'tag-orange';
                break;
            case 'high':
                className += 'tag-red';
                break;
            default:
                className += '';
                break;
        }
        return <span className={className}>{value}</span>;
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(tasks.length / itemsPerPage);
        const pageNumbers = [];
        const displayPages = 5;
        const groupSize = 10;

        let startPage = Math.max(currentPage - Math.floor(displayPages / 2), 1);
        let endPage = startPage + displayPages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(endPage - displayPages + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <Pagination>
                <PaginationContent>
                    {currentPage !== 1 && <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />}
                    {startPage > 1 && (
                        <>
                            <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                            </PaginationItem>
                            {startPage > 2 && (
                                <PaginationItem>
                                    <PaginationLink>...</PaginationLink>
                                </PaginationItem>
                            )}
                        </>
                    )}
                    {pageNumbers.map((page) => (
                        <PaginationItem key={page}>
                            <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <PaginationItem>
                                    <PaginationLink>...</PaginationLink>
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                            </PaginationItem>
                        </>
                    )}
                    {currentPage !== totalPages && <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />}
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <div className="container mx-auto py-12 outlined-container">
            <h1 className="text-3xl font-bold mb-6">Requirements Management</h1>
            <div className="mb-4 flex space-x-4">
                <Input
                    placeholder="Search by description"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Select value={filters.employee} onValueChange={(value) => handleFilterChange('employee', value)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.firstName} {employee.lastName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={() => { setIsModalOpen(true); setActiveTab('general'); }} className="mb-6">
                Create Requirements
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Requirements</DialogTitle>
                        <DialogDescription>Fill in the requirements details.</DialogDescription>
                    </DialogHeader>
                    <Tabs value={activeTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="general" onClick={() => setActiveTab('general')}>
                                General
                            </TabsTrigger>
                            <TabsTrigger value="details" onClick={() => setActiveTab('details')}>
                                Details
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="general">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="taskTitle">Requirements Title</Label>
                                    <Input
                                        id="taskTitle"
                                        placeholder="Enter Requirements title"
                                        value={newTask.taskTitle}
                                        onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="taskDescription">Requirements Description</Label>
                                    <Input
                                        id="taskDescription"
                                        placeholder="Enter Requirements description"
                                        value={newTask.taskDescription}
                                        onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                                        <SelectTrigger className="w-[280px]">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Birthday">Requirements</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleNext}>Next</Button>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="details">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-[280px] justify-start text-left font-normal ${!newTask.dueDate && 'text-muted-foreground'}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newTask.dueDate ? format(new Date(newTask.dueDate), 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                                                onSelect={(date) => setNewTask({ ...newTask, dueDate: date?.toISOString() || '' })}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assignedToId">Assigned To</Label>
                                    <Select
                                        value={newTask.assignedToId ? newTask.assignedToId.toString() : ''}
                                        onValueChange={(value) => {
                                            const selectedEmployee = employees.find((emp) => emp.id === parseInt(value));
                                            setNewTask({
                                                ...newTask,
                                                assignedToId: parseInt(value),
                                                assignedToName: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Unknown',
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-[280px]">
                                            <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {employee.firstName} {employee.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                                        <SelectTrigger className="w-[280px]">
                                            <SelectValue placeholder="Select a priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="storeId">Store</Label>
                                    <Select
                                        value={newTask.storeId ? newTask.storeId.toString() : ''}
                                        onValueChange={(value) => setNewTask({ ...newTask, storeId: parseInt(value) })}
                                    >
                                        <SelectTrigger className="w-[280px]">
                                            <SelectValue placeholder="Select a store" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores.map((store) => (
                                                <SelectItem key={store.id} value={store.id.toString()}>
                                                    {store.storeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Button variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                    <Button onClick={createTask}>Create Requirements</Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>Modify the Requirements details.</DialogDescription>
                    </DialogHeader>
                    {editTask && (
                        <Tabs value={activeTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="general" onClick={() => setActiveTab('general')}>
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="details" onClick={() => setActiveTab('details')}>
                                    Details
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="general">
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="taskTitle">Requirements Title</Label>
                                        <Input
                                            id="taskTitle"
                                            placeholder="Enter Requirements title"
                                            value={editTask.taskTitle}
                                            onChange={(e) => setEditTask({ ...editTask, taskTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="taskDescription">Requirements Description</Label>
                                        <Input
                                            id="taskDescription"
                                            placeholder="Enter Requirements description"
                                            value={editTask.taskDescription}
                                            onChange={(e) => setEditTask({ ...editTask, taskDescription: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={editTask.category} onValueChange={(value) => setEditTask({ ...editTask, category: value })}>
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Requirements">Requirements</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleNext}>Next</Button>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="details">
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-[280px] justify-start text-left font-normal ${!editTask.dueDate && 'text-muted-foreground'}`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {editTask.dueDate ? format(new Date(editTask.dueDate), 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={editTask.dueDate ? new Date(editTask.dueDate) : undefined}
                                                    onSelect={(date) => setEditTask({ ...editTask, dueDate: date?.toISOString() || '' })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="assignedToId">Assigned To</Label>
                                        <Select
                                            value={editTask.assignedToId ? editTask.assignedToId.toString() : ''}
                                            onValueChange={(value) => {
                                                const selectedEmployee = employees.find((emp) => emp.id === parseInt(value));
                                                setEditTask({
                                                    ...editTask,
                                                    assignedToId: parseInt(value),
                                                    assignedToName: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Unknown',
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select an employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                                        {employee.firstName} {employee.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={editTask.priority} onValueChange={(value) => setEditTask({ ...editTask, priority: value })}>
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select a priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="storeId">Store</Label>
                                        <Select
                                            value={editTask.storeId ? editTask.storeId.toString() : ''}
                                            onValueChange={(value) => setEditTask({ ...editTask, storeId: parseInt(value) })}
                                        >
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select a store" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stores.map((store) => (
                                                    <SelectItem key={store.id} value={store.id.toString()}>
                                                        {store.storeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <Button variant="outline" onClick={handleBack}>
                                            Back
                                        </Button>
                                        <Button onClick={updateTask}>Update Requirements</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>

            <div className="table-container">
                <Table>
                    <TableCaption>List of Requirements</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('taskTitle')}>
                                Title
                                {sortColumn === 'taskTitle' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('taskDescription')}>
                                Description
                                {sortColumn === 'taskDescription' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                                Due Date
                                {sortColumn === 'dueDate' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('assignedToName')}>
                                Assigned To
                                {sortColumn === 'assignedToName' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('storeName')}>
                                Store Name
                                {sortColumn === 'storeName' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('storeCity')}>
                                Store City
                                {sortColumn === 'storeCity' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                                Status
                                {sortColumn === 'status' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>
                                Priority
                                {sortColumn === 'priority' && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">
                                    No requirements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks
                                .filter(
                                    (task) =>
                                        (task.taskDescription?.toLowerCase() || '').includes(filters.search.toLowerCase()) &&
                                        (filters.employee === '' || filters.employee === 'all'
                                            ? true
                                            : task.assignedToId === parseInt(filters.employee)) &&
                                        (filters.priority === '' || filters.priority === 'all' ? true : task.priority === filters.priority) &&
                                        (filters.status === '' || filters.status === 'all' ? true : task.status === filters.status)
                                )
                                .map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.taskTitle}</TableCell>
                                        <TableCell>{task.taskDescription}</TableCell>
                                        <TableCell>{format(new Date(task.dueDate ?? new Date()), 'PPP')}</TableCell>
                                        <TableCell>{task.assignedToName}</TableCell>
                                        <TableCell>{task.storeName}</TableCell>
                                        <TableCell>{task.storeCity}</TableCell>
                                        <TableCell>{renderTag(task.status, 'status')}</TableCell>
                                        <TableCell>{renderTag(task.priority, 'priority')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditTask(task);
                                                            setIsEditModalOpen(true);
                                                            setActiveTab('general');
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => deleteTask(task.id)}>Delete</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleViewStore(task.storeId)}>View Store</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewFieldOfficer(task.assignedToId)}>View Field Officer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-8 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span>Items per page:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {renderPagination()}
            </div>
        </div>
    );
};

export default Requirements;
