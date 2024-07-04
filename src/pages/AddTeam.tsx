import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Select from 'react-select';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    city: string;
}

interface OfficeManager {
    id: number;
    firstName: string;
    lastName: string;
    city: string;
    email: string;
}

const AddTeam = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [officeManager, setOfficeManager] = useState<{ value: number, label: string } | null>(null);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [officeManagers, setOfficeManagers] = useState<OfficeManager[]>([]);
    const [cities, setCities] = useState<{ value: string, label: string }[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const token = useSelector((state: RootState) => state.auth.token);
    const { toast } = useToast();

    useEffect(() => {
        if (isModalOpen && token) {
            fetchOfficeManagers();
            fetchCities();
            fetchAssignedFieldOfficers();
        }
    }, [isModalOpen, token]);

    const fetchOfficeManagers = async () => {
        try {
            const allManagersResponse = await axios.get(
                "http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getByRole?role=Manager",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const teamsResponse = await axios.get(
                "http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/getAll",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const assignedManagerIds = teamsResponse.data.map((team: any) => team.officeManager.id);
            const availableManagers = allManagersResponse.data.filter((manager: OfficeManager) => !assignedManagerIds.includes(manager.id));

            setOfficeManagers(availableManagers);
        } catch (error) {
            console.error("Error fetching office managers:", error);
            toast({
                title: "Error",
                description: "Failed to fetch office managers. Please try again.",
                variant: "destructive",
            });
        }
    };

    const fetchCities = async () => {
        try {
            const response = await axios.get(
                "http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getCities",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCities(response.data.map((city: string) => ({ value: city, label: city })));
        } catch (error) {
            console.error("Error fetching cities:", error);
            toast({
                title: "Error",
                description: "Failed to fetch cities. Please try again.",
                variant: "destructive",
            });
        }
    };

    const fetchAssignedFieldOfficers = async () => {
        try {
            const teamsResponse = await axios.get(
                "http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/getAll",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const assignedFieldOfficerIds = teamsResponse.data.flatMap((team: any) => team.fieldOfficers.map((officer: Employee) => officer.id));
            return assignedFieldOfficerIds;
        } catch (error) {
            console.error("Error fetching assigned field officers:", error);
            toast({
                title: "Error",
                description: "Failed to fetch assigned field officers. Please try again.",
                variant: "destructive",
            });
            return [];
        }
    };

    useEffect(() => {
        const fetchEmployeesByCity = async () => {
            const allEmployees: Employee[] = [];

            for (const city of selectedCities) {
                try {
                    const response = await axios.get(
                        `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getFieldOfficerByCity?city=${city}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    allEmployees.push(...response.data);
                } catch (error) {
                    console.error(`Error fetching employees for city ${city}:`, error);
                    toast({
                        title: "Error",
                        description: `Failed to fetch employees for ${city}. Please try again.`,
                        variant: "destructive",
                    });
                }
            }

            const assignedFieldOfficerIds = await fetchAssignedFieldOfficers();
            const availableEmployees = allEmployees.filter((employee) => !assignedFieldOfficerIds.includes(employee.id));
            setEmployees(availableEmployees);
        };

        if (selectedCities.length > 0) {
            fetchEmployeesByCity();
        }
    }, [selectedCities, token]);

    const handleCreateTeam = async () => {
        if (!officeManager) {
            toast({
                title: "Error",
                description: "Please select an office manager.",
                variant: "destructive",
            });
            return;
        }

        if (selectedEmployees.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one team member.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await axios.post(
                "http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/create",
                {
                    officeManager: officeManager.value,
                    fieldOfficers: selectedEmployees,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Team created successfully!",
                });
                setIsModalOpen(false);
                // Reset form
                setOfficeManager(null);
                setSelectedCities([]);
                setSelectedEmployees([]);
            }
        } catch (error: any) {
            console.error("Error creating team:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast({
                    title: "Error Creating Team",
                    description: error.response.data.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>Add Team</Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="officeManager">Office Manager</label>
                            <Select
                                id="officeManager"
                                value={officeManager}
                                onChange={(option) => setOfficeManager(option)}
                                options={officeManagers.map(manager => ({
                                    value: manager.id,
                                    label: `${manager.firstName} ${manager.lastName} (${manager.email})`
                                }))}
                                placeholder="Select an office manager"
                            />
                        </div>
                        <div>
                            <label htmlFor="city">City</label>
                            <Select
                                id="city"
                                isMulti
                                value={selectedCities.map(city => ({ value: city, label: city }))}
                                onChange={(selectedOptions) => setSelectedCities(selectedOptions.map(option => option.value))}
                                options={cities}
                                placeholder="Select cities"
                            />
                        </div>
                        <div>
                            <label>Team Members</label>
                            <div className="max-h-60 overflow-y-auto">
                                {employees.map((employee) => (
                                    <div key={employee.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`employee-${employee.id}`}
                                            checked={selectedEmployees.includes(employee.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedEmployees([...selectedEmployees, employee.id]);
                                                } else {
                                                    setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`employee-${employee.id}`}>
                                            {employee.firstName} {employee.lastName}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateTeam}
                            disabled={!officeManager || selectedEmployees.length === 0}
                        >
                            Create Team
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddTeam;
