import { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  city: string; // Add the 'city' property
  state: string; // Add the 'state' property
  // Add other properties as needed
}
const Employeelist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedColumns, setSelectedColumns] = useState(['name', 'email', 'city', 'state', 'role', 'department', 'dateOfJoining', 'primaryContact', 'userName', 'password', 'actions']);
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



  const handleNextClick = async () => {
    try {
      const response = await fetch('http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/employee/add', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          primaryContact: newEmployee.primaryContact,
          departmentName: newEmployee.departmentName,
          email: newEmployee.email,
          role: newEmployee.role,
          employeeId: "E101",
          addressLine1: newEmployee.addressLine1,
          addressLine2: newEmployee.addressLine2,
          city: newEmployee.city,
          state: newEmployee.state,
          country: newEmployee.country,
          pincode: newEmployee.pincode,
          dateOfJoining: newEmployee.dateOfJoining
        }),
      });

      const data = await response.json();
      if (data && data.id) {
        setNewEmployee({ ...newEmployee, employeeId: data.id });
        setActiveTab('tab2');
      } else {
        // Handle error scenario
        console.error('Error adding employee:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
    userName: "", // Add the 'userName' property
    password: "", // Add the 'password' property
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
        userName: employee.userName,
        password: employee.password,
        primaryContact: employee.primaryContact,
        dateOfJoining: employee.dateOfJoining, // Add the 'dateOfJoining' property
        name: `${employee.firstName} ${employee.lastName}`, // Add the 'name' property
        department: employee.departmentName, // Add the 'department' property
        actions: '', // Add the 'actions' property (you can set it to an empty string or any other appropriate value)
        city: employee.city,
        state: employee.state,
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
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/employee/delete?id=${employeeId}`, {
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
          const deleteUserResponse = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/user/manage/delete?username=${employee.userName}`, {
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
        const updateUrl = `http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/employee/edit?empId=${editingEmployee.id}`;

        const payload = {
          role: editingEmployee.role,
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
          console.log('Employee updated!'); // Or use another way to notify the user about the success

          // Update the users state with the edited employee data
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === editingEmployee.id ? editingEmployee : user
            )
          );

          setEditingEmployee(null);
        } else {
          const errorData = await response.text();
          console.error('Error:', errorData); // Handle error scenario
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle any network or other errors
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
      const response = await fetch('http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/user/manage/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newEmployee.userName,
          password: newEmployee.password,
          employeeId: newEmployee.employeeId,
        }),
      });

      if (response.ok) {
        console.log('User credentials created successfully!');
        setIsModalOpen(false); // Close the modal after successful operations
        // Update the UI to show the new employee, or fetch the employee list again if necessary
      } else {
        const errorData = await response.text();
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/employee/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: User[] = await response.json();
      console.log('Fetched employees:', data); // Add this line to log the fetched data
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
              {/* <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('userName')}
                onCheckedChange={() => handleColumnSelection('userName')}
              >
                User Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedColumns.includes('password')}
                onCheckedChange={() => handleColumnSelection('password')}
              >
                Password
              </DropdownMenuCheckboxItem> */}
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
              <Tabs defaultValue="tab1" className="mt-6">
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="primaryContact">Primary Contact</Label>
                        <Input
                          id="primaryContact"
                          name="primaryContact"
                          value={newEmployee.primaryContact}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* <div className="text-lg font-semibold mt-6 mb-2">Address</div> */}
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
                            <SelectItem value="Office">Office</SelectItem>
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
                            <SelectItem value="Office Manager">Office Manager</SelectItem>
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
                      <Button onClick={handleNextClick}>Next</Button>
                    ) : (
                      <div>Loading...</div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="tab2">
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
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={newEmployee.password}
                          onChange={handleInputChange}
                        />
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
            {/* {selectedColumns.includes('userName') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('userName')}>
                User Name
                {sortColumn === 'userName' && (
                  <span className="w-full">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )}
            {selectedColumns.includes('password') && (
              <TableHead className="cursor-pointer" onClick={() => handleSort('password')}>
                Password
                {sortColumn === 'password' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHead>
            )} */}
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
                      onChange={handleInputChange}
                      className="w-full py-2 px-4"
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('role') && (
                <TableCell className="text-left px-4" style={{ width: '150px' }}>
                  {editingEmployee?.id === user.id ? (
                    <Select
                      name="role"
                      value={editingEmployee.role}
                      onValueChange={(value) =>
                        setEditingEmployee({ ...editingEmployee, role: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Field Officer">Field Officer</SelectItem>
                        <SelectItem value="Office Manager">Office Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    user.role
                  )}
                </TableCell>
              )}
              {selectedColumns.includes('department') && (
                <TableCell className="text-left px-4" style={{ width: '150px' }}>
                  {editingEmployee?.id === user.id ? (
                    <Select
                      name="departmentName"
                      value={editingEmployee.departmentName}
                      onValueChange={(value) =>
                        setEditingEmployee({ ...editingEmployee, departmentName: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    user.departmentName
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
                      onChange={handleInputChange}
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }} // Increase the width here
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
                      onChange={handleInputChange}
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }} // Increase the width here
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
                      onChange={handleInputChange}
                      className="w-full py-2 px-4"
                      style={{ minWidth: '250px' }} // Increase the width here
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