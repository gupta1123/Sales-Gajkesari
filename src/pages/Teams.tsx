import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast"
import styles from './Teams.module.css';

interface Team {
    id: number;
    officeManager: {
        firstName: string | null;
        lastName: string | null;
        assignedCity: string;
    };
    fieldOfficers: FieldOfficer[];
}

interface FieldOfficer {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
}

const Teams: React.FC<{ authToken: string | null }> = ({ authToken }) => {
    const { toast } = useToast()
    const [teams, setTeams] = useState<Team[]>([]);
    const [isDataAvailable, setIsDataAvailable] = useState<boolean>(true);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [deleteTeamId, setDeleteTeamId] = useState<number | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [fieldOfficers, setFieldOfficers] = useState<FieldOfficer[]>([]);
    const [selectedFieldOfficers, setSelectedFieldOfficers] = useState<number[]>([]);
    const [assignedCity, setAssignedCity] = useState<string | null>(null);

    const fetchTeams = useCallback(async () => {
        try {
            const response = await axios.get('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/getAll', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setTeams(response.data);
            setIsDataAvailable(response.data.length > 0);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setIsDataAvailable(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const showDeleteModal = (teamId: number) => {
        setDeleteTeamId(teamId);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteTeam = async () => {
        try {
            await axios.delete(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/delete?id=${deleteTeamId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            await fetchTeams();
            setIsDeleteModalVisible(false);
            toast({
                title: "Team deleted",
                description: "The team has been successfully deleted.",
            })
        } catch (error) {
            console.error('Error deleting team:', error);
            toast({
                title: "Error",
                description: "Failed to delete the team. Please try again.",
                variant: "destructive",
            })
        }
    };

    const fetchFieldOfficersByCity = useCallback(async (city: string, teamId: number) => {
        try {
            const response = await axios.get(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getFieldOfficerByCity?city=${city}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const allFieldOfficers: FieldOfficer[] = response.data;
            const currentTeam = teams.find(team => team.id === teamId);
            const currentTeamMemberIds = currentTeam ? currentTeam.fieldOfficers.map(officer => officer.id) : [];
            const availableFieldOfficers = allFieldOfficers.filter((officer: FieldOfficer) => !currentTeamMemberIds.includes(officer.id));
            setFieldOfficers(availableFieldOfficers);
        } catch (error) {
            console.error('Error fetching field officers:', error);
        }
    }, [authToken, teams]);

    const showEditModal = async (team: Team) => {
        setSelectedTeamId(team.id);
        const city = team.officeManager.assignedCity;
        setAssignedCity(city);
        await fetchFieldOfficersByCity(city, team.id);
        setIsEditModalVisible(true);
    };

    const handleAddFieldOfficer = async () => {
        if (selectedFieldOfficers.length === 0) {
            toast({
                title: "No officers selected",
                description: "Please select at least one field officer to add.",
                variant: "destructive",
            })
            return;
        }

        try {
            await axios.put(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/addFieldOfficer?id=${selectedTeamId}`, {
                fieldOfficers: selectedFieldOfficers,
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            await fetchTeams();
            setIsEditModalVisible(false);
            setSelectedFieldOfficers([]);
            toast({
                title: "Field officers added",
                description: "The selected field officers have been added to the team.",
            })
        } catch (error) {
            console.error('Error adding field officer:', error);
            toast({
                title: "Error",
                description: "Failed to add field officers. Please try again.",
                variant: "destructive",
            })
        }
    };

    const handleRemoveFieldOfficer = async (teamId: number, fieldOfficerId: number) => {
        try {
            await axios.delete(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/deleteFieldOfficer?id=${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    fieldOfficers: [fieldOfficerId],
                },
            });
            await fetchTeams();
        } catch (error) {
            console.error('Error removing field officer:', error);
        }
    };

    return (
        <div className={styles.teamContainer}>
            <h2 className={styles.pageTitle}>Team Management</h2>
            {isDataAvailable ? (
                <>
                    {teams.map((team) => (
                        <Card key={team.id} className={styles.teamCard}>
                            <CardHeader>
                                <CardTitle className={styles.cardTitle}>
                                    {team.officeManager?.firstName ?? 'N/A'} {team.officeManager?.lastName ?? 'N/A'}&apos;s Team
                                </CardTitle>
                                <div className={styles.cityBadge}>
                                    City: {team.officeManager.assignedCity}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {team.fieldOfficers.map((officer) => (
                                            <tr key={officer.id}>
                                                <td>{`${officer.firstName} ${officer.lastName}`}</td>
                                                <td>{officer.role}</td>
                                                <td>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveFieldOfficer(team.id, officer.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className={styles.cardActions}>
                                    <Button
                                        className={styles.addButton}
                                        onClick={() => showEditModal(team)}
                                    >
                                        Add Field Officer
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => showDeleteModal(team.id)}
                                    >
                                        Delete Team
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </>
            ) : (
                <p className={styles.noDataMessage}>No teams available. Please try again later.</p>
            )}

            <Dialog open={isDeleteModalVisible} onOpenChange={setIsDeleteModalVisible}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this team?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalVisible(false)}>Cancel</Button>
                        <Button onClick={handleDeleteTeam}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalVisible} onOpenChange={setIsEditModalVisible}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Field Officer</DialogTitle>
                    </DialogHeader>
                    <div className={styles.modalBody}>
                        <p className={styles.modalTitle}>Manager&apos;s Assigned City: {assignedCity ?? 'N/A'}</p>
                        <div className={styles.officerList}>
                            {fieldOfficers.map((officer) => (
                                <div key={officer.id} className={styles.checkboxContainer}>
                                    <Checkbox
                                        id={`officer-${officer.id}`}
                                        checked={selectedFieldOfficers.includes(officer.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFieldOfficers(prev =>
                                                checked
                                                    ? [...prev, officer.id]
                                                    : prev.filter(id => id !== officer.id)
                                            );
                                        }}
                                    />
                                    <label htmlFor={`officer-${officer.id}`} className={styles.checkboxLabel}>
                                        {`${officer.firstName} ${officer.lastName} (${officer.role})`}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
                        <Button onClick={handleAddFieldOfficer} disabled={selectedFieldOfficers.length === 0}>
                            Add Selected Officers
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Teams;
