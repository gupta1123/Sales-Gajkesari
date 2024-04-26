import { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Avatar } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import "./Employeelist.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/router';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentName: string;
  userName: string;
  password: string;
  primaryContact: string;
  dateOfJoining: string;
  name: string;
  department: string;
  actions: string;
  city: string;
  state: string;
  userDto: {
    username: string;
    password: string | null;
    roles: string | null;
    employeeId: number | null;
    firstName: string | null;
    lastName: string | null;
  };
  // Add other properties as needed
}

const Employeelist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedColumns, setSelectedColumns] = useState(['name', 'email', 'city', 'state', 'role', 'department', 'userName', 'dateOfJoining', 'primaryContact', 'actions']);
  const router = useRouter();
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState("tab1");
  const [activeTab, setActiveTab] = useState('tab1');
  const [showPassword, setShowPassword] = useState(false);
  const handleNextClick = () => {
    setActiveTab('tab2');
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    primaryContact: "",
    secondaryContact: "",
    departmentName: "",
    email: "",
    role: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    dateOfJoining: "",
    userName: "",
    password: "",
  });

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token]);

  const handleEditUser = (employeeId: number) => {
    const employee = users.find((user) => user.id === employeeId);
    if (employee) {
      setEditingEmployee({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        departmentName: employee.departmentName,
        userName: employee.userDto?.username || '',
        password: employee.password,
        primaryContact: employee.primaryContact,
        dateOfJoining: employee.dateOfJoining,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.departmentName,
        actions: '',
        city: employee.city,
        state: employee.state,
        userDto: employee.userDto,
        // Add other properties as needed
      });
    }
  };

  const handleResetPassword = (userId: number | string) => {
    setResetPasswordUserId(userId);
    setIsResetPasswordOpen(true);
  };

  const handleResetPasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Close the dialog box and reset the form
    setIsResetPasswordOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  const handleDeleteUser = async (employeeId: number) => {
    try {
      const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/delete?id=${employeeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.text();
        console.log(data);

        // Delete user credentials
        const employee = users.find((user) => user.id === employeeId);
        if (employee) {
          const deleteUserResponse = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/user/manage/delete?username=${employee.userName}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (deleteUserResponse.ok) {
            console.log('User credentials deleted!');
          } else {
            console.error('Failed to delete user credentials');
          }
        }

        setUsers(users.filter(user => user.id !== employeeId));
      } else {
        const errorData = await response.text();
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (editingEmployee) {
      try {
        const updateUrl = `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/edit?empId=${editingEmployee.id}`;

        const payload = {
          role: editingEmployee.role,
          userDto: {
            username: editingEmployee.userName,
          },
        };

        const response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log('Employee updated!');

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === editingEmployee.id ? editingEmployee : user
            )
          );

          setEditingEmployee(null);
        } else {
          const errorData = await response.text();
          console.error('Error:', errorData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleViewUser = (userId: number) => {
    // This navigates to the dynamic route by passing the userId as a query parameter
    router.push(`/SalesExecutive/${userId}`);
  };

  const handleAddEmployee = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee-user/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: {
              username: newEmployee.userName,
              password: newEmployee.password,
            },
            employee: {
              firstName: newEmployee.firstName,
              lastName: newEmployee.lastName,
              employeeId: newEmployee.employeeId,
              primaryContact: newEmployee.primaryContact,
              secondaryContact: newEmployee.secondaryContact,
              departmentName: newEmployee.departmentName,
              email: newEmployee.email,
              role: newEmployee.role,
              addressLine1: newEmployee.addressLine1,
              addressLine2: newEmployee.addressLine2,
              city: newEmployee.city,
              state: newEmployee.state,
              country: newEmployee.country,
              pincode: newEmployee.pincode,
              dateOfJoining: newEmployee.dateOfJoining,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error:", errorData);
        throw new Error("Error adding employee!");
      }

      console.log("API response:", response);

      // Close the modal
      setIsModalOpen(false);

      // Refresh the page to get the updated employee list
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: User[] = await response.json();
      console.log('Fetched employees:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (`${user.firstName} ${user.lastName}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const sortedUsers = [...paginatedUsers].sort((a, b) => {
    if (sortColumn) {
      const valueA = a[sortColumn] as string;
      const valueB = b[sortColumn] as string;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc' ? Number(valueA) - Number(valueB) : Number(valueB) - Number(valueA);
      }
    }
    return 0;
  });

  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === paginatedUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedUsers.map((user) => user.id));
    }
  };

  const handleSelectRow = (userId: number) => {
    if (selectedRows.includes(userId)) {
      setSelectedRows(selectedRows.filter((id) => id !== userId));
    } else {
      setSelectedRows([...selectedRows, userId]);
    }
  };

  const handleColumnSelection = (column: keyof User) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Employee List</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Select Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('name')}
                onCheckedChange={() => handleColumnSelection('name')}
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('email')}
                onCheckedChange={() => handleColumnSelection('email')}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('role')}
                onCheckedChange={() => handleColumnSelection('role')}
              >
                Role
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('department')}
                onCheckedChange={() => handleColumnSelection('department')}
              >
                Department
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('dateOfJoining')}
                onCheckedChange={() => handleColumnSelection('dateOfJoining')}
              >
                Date of Joining
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('primaryContact')}
                onCheckedChange={() => handleColumnSelection('primaryContact')}
              >
                Phone
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('actions')}
                onCheckedChange={() => handleColumnSelection('actions')}
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter a new password for the user.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResetPasswordSubmit}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} className="mt-6">
                <TabsList>
                  <TabsTrigger value="tab1">Personal & Work</TabsTrigger>
                  <TabsTrigger value="tab2">Credentials</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <div className="grid gap-4 py-4">
                    <div className="text-lg font-semibold mb-2">Personal Information</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={newEmployee.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={newEmployee.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          value={newEmployee.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          name="employeeId"
                          value={newEmployee.employeeId}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="primaryContact">Primary Contact</Label>
                        <Input
                          id="primaryContact"
                          name="primaryContact"
                          value={newEmployee.primaryContact}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                      <Input
                        id="addressLine1"
                        name="addressLine1"
                        value={newEmployee.addressLine1}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        name="addressLine2"
                        value={newEmployee.addressLine2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={newEmployee.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={newEmployee.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={newEmployee.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={newEmployee.pincode}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="text-lg font-semibold mt-6 mb-2">Work Information</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="departmentName">Department</Label>
                        <Select
                          value={newEmployee.departmentName}
                          onValueChange={(value) =>
                            setNewEmployee({ ...newEmployee, departmentName: value })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          name="role"
                          value={newEmployee.role}
                          onValueChange={(value) =>
                            setNewEmployee({ ...newEmployee, role: value })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Field Officer">Field Officer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dateOfJoining">Date of Joining</Label>
                        <Input
                          id="dateOfJoining"
                          name="dateOfJoining"
                          type="date"
                          value={newEmployee.dateOfJoining}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {activeTab === 'tab1' ? (
                      <Button
                        onClick={handleNextClick}
                        disabled={!newEmployee.firstName || !newEmployee.lastName || !newEmployee.primaryContact}
                      >
                        Next
                      </Button>
                    ) : (
                      <div>Loading...</div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="tab2">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab('tab1')}
                      className="p-2"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="grid gap-4 py-4">
                    <div className="text-lg font-semibold mb-2">User Credentials</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userName">User Name</Label>
                        <Input
                          id="userName"
                          name="userName"
                          value={newEmployee.userName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={newEmployee.password}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    </div>
                  <div className="mt-4">
                    <Button onClick={handleSubmit}>Add Employee</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Table>
        <TableCaption>List of users</TableCaption>
        <TableHeader>
          <TableRow>
            {selectedColumns.includes('name') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Name
                {sortColumn === 'name' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('email') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                Email
                {sortColumn === 'email' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('role') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                Role
                {sortColumn === 'role' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('department') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('department')}>
                Department
                {sortColumn === 'department' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('userName') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('userName')}>
                User Name
                {sortColumn === 'userName' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('primaryContact') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('primaryContact')}>
                Phone
                {sortColumn === 'primaryContact' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('city') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('city')}>
                City
                {sortColumn === 'city' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('state') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('state')}>
                State
                {sortColumn === 'state' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('dateOfJoining') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('dateOfJoining')}>
                Date of Joining
                {sortColumn === 'dateOfJoining' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('actions') && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              {selectedColumns.includes('name') && (
                <TableCell className="text-left px-4" style={{ width: '200px' }}>
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="name"
                      value={`${editingEmployee.firstName} ${editingEmployee.lastName}`}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          firstName: e.target.value.split(' ')[0] || '',
                          lastName: e.target.value.split(' ')[1] || '',
                        })
                      }
                      className="w-full py-2 px-4"
                      style={{ width: '200px' }}
                    />
                  ) : (
                    `${user.firstName || ''} ${user.lastName || ''}`
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('email') && (
                <TableCell className="text-left px-4" style={{ width: '250px' }}>
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="email"
                      value={editingEmployee.email}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, email: e.target.value })
                      }
                      className="w-full py-2 px-4"
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('role') && (
                <TableCell className="text-left px-4" style={{ width: '150px' }}>
                  {user.role}
                </TableCell>
              )}
              {selectedColumns.includes('department') && (
                <TableCell className="text-left px-4" style={{ width: '150px' }}>
                  {user.departmentName}
                </TableCell>
              )}
              {selectedColumns.includes('userName') && (
                <TableCell className="text-left px-4" style={{ width: '150px' }}>
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="userName"
                      value={editingEmployee.userName}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, userName: e.target.value })
                      }
                      className="w-full py-2 px-4"
                      style={{ minWidth: '150px' }}
                    />
                  ) : (
                    user.userDto?.username || ''
                  )}
                </TableCell>
              )}
              {/* {selectedColumns.includes('password') && (
                <TableCell className="text-left px-4">
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="password"
                      type="password"
                      value={editingEmployee.password}
                      onChange={handleInputChange}
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }} // Increase the width here
                    />
                  ) : (
                    '********'
                  )}
                </TableCell>
              )} */}
              {selectedColumns.includes('primaryContact') && (
                <TableCell className="text-left px-4">
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="primaryContact"
                      value={editingEmployee.primaryContact}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, primaryContact: e.target.value })
                      }
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }}
                    />
                  ) : (
                    user.primaryContact
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('city') && (
                <TableCell className="text-left px-4">
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="city"
                      value={editingEmployee.city}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, city: e.target.value })
                      }
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }}
                    />
                  ) : (
                    user.city
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('state') && (
                <TableCell className="text-left px-4">
                  {editingEmployee?.id === user.id ? (
                    <Input
                      name="state"
                      value={editingEmployee.state}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, state: e.target.value })
                      }
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }}
                    />
                  ) : (
                    user.state
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('dateOfJoining') && (
                <TableCell className="text-left px-4">
                  {format(new Date(user.dateOfJoining), 'dd/MM/yyyy')}
                </TableCell>
              )}
              {selectedColumns.includes('actions') && (
                <TableCell className="text-right">
                  {editingEmployee?.id === user.id ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEmployee(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleEditUser(user.id)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteUser(user.id)}>Delete</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleViewUser(user.id)}>View</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleResetPassword(user.id)}>Reset Password</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>

      </Table>
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {endIndex} of {filteredUsers.length} users
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
              >
                Previous
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))}
              >
                Next
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Employeelist;  