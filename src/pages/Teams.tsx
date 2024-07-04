'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RootState } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, message, Table, Checkbox } from 'antd';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import styles from './Teams.module.css';

const { Column } = Table;

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
    email: string;
}

const Teams: React.FC<{ authToken: string | null }> = ({ authToken }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isDataAvailable, setIsDataAvailable] = useState<boolean>(true);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [deleteTeamId, setDeleteTeamId] = useState<number | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [fieldOfficers, setFieldOfficers] = useState<FieldOfficer[]>([]);
    const [selectedFieldOfficers, setSelectedFieldOfficers] = useState<number[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
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

    const fetchCities = useCallback(async () => {
        try {
            const response = await axios.get('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getCities', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setCities(response.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    }, [authToken]);

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
            message.success('Team Deleted Successfully!');
            fetchTeams();
        } catch (error) {
            console.error('Error deleting team:', error);
            message.error('Failed to delete team.');
        } finally {
            setIsDeleteModalVisible(false);
        }
    };

    const fetchFieldOfficersByCity = useCallback(async (city: string) => {
        try {
            const response = await axios.get(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/getFieldOfficerByCity?city=${city}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setFieldOfficers(response.data);
        } catch (error) {
            console.error('Error fetching field officers:', error);
        }
    }, [authToken]);

    const showEditModal = async (team: Team) => {
        setSelectedTeamId(team.id);
        await fetchCities();
        const city = team.officeManager.assignedCity;
        setAssignedCity(city);
        setSelectedCity(city);
        await fetchFieldOfficersByCity(city);
        setIsEditModalVisible(true);
    };

    const handleCityChange = async (city: string) => {
        if (assignedCity && city !== assignedCity) {
            message.error("You can't create a team with a different city.");
            setSelectedCity(assignedCity);
            await fetchFieldOfficersByCity(assignedCity);
        } else {
            setSelectedCity(city);
            await fetchFieldOfficersByCity(city);
        }
    };

    const handleAddFieldOfficer = async () => {
        try {
            await axios.put(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/employee/team/addFieldOfficer?id=${selectedTeamId}`, {
                fieldOfficers: selectedFieldOfficers,
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            message.success('Field Officer Added Successfully!');
            fetchTeams();
        } catch (error) {
            console.error('Error adding field officer:', error);
            message.error('Failed to add field officer.');
        } finally {
            setIsEditModalVisible(false);
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
            message.success('Field Officer Removed From Team Successfully!');
            fetchTeams();
        } catch (error) {
            console.error('Error removing field officer:', error);
            message.error('Failed to remove field officer.');
        }
    };

    return (
        <div className={styles.teamContainer}>
            <h2>Teams</h2>
            {isDataAvailable ? (
                <>
                    {teams.map((team) => (
                        <Card key={team.id} className={styles.teamCard}>
                            <CardHeader>
                                <CardTitle>
                                    {team.officeManager?.firstName ?? 'N/A'} {team.officeManager?.lastName ?? 'N/A'}&apos;s Team
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table dataSource={team.fieldOfficers} rowKey="id" pagination={false}>
                                    <Column
                                        title="Name"
                                        dataIndex="name"
                                        key="name"
                                        render={(text, officer: FieldOfficer) => `${officer.firstName} ${officer.lastName}`}
                                    />
                                    <Column title="Role" dataIndex="role" key="role" />
                                    <Column title="Email" dataIndex="email" key="email" />
                                    <Column
                                        title="Action"
                                        key="action"
                                        render={(text, officer: FieldOfficer) => (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveFieldOfficer(team.id, officer.id)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    />
                                </Table>
                                <Button
                                    className={`${styles.mt4} ${styles.addButton}`}
                                    onClick={() => showEditModal(team)}
                                >
                                    Add Field Officer
                                </Button>
                                <Button
                                    className={`${styles.mt4} ${styles.ml4}`}
                                    variant="destructive"
                                    onClick={() => showDeleteModal(team.id)}
                                >
                                    Delete Team
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </>
            ) : (
                <p className={styles.noDataMessage}>No teams available. Please try again later.</p>
            )}

            {/* Delete Modal */}
            <Modal
                title="Delete Team"
                visible={isDeleteModalVisible}
                onOk={handleDeleteTeam}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this team?</p>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Add Field Officer"
                visible={isEditModalVisible}
                onOk={handleAddFieldOfficer}
                onCancel={() => setIsEditModalVisible(false)}
                okText={<span className={styles.addModalButton}>Add</span>}
                footer={null}
            >
                <div className={styles.modalBody}>
                    <p className={styles.modalTitle}>Manager&apos;s Assigned City: {assignedCity ?? 'N/A'}</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className={styles.dropdownButton}>{selectedCity || 'Select City'}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={styles.dropdownContent}>
                            {cities.map((city) => (
                                <DropdownMenuItem key={city} onClick={() => handleCityChange(city)}>
                                    {city}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className={styles.selectContainer}>
                        {fieldOfficers.map((officer) => (
                            <div key={officer.id} className={styles.checkboxContainer}>
                                <Checkbox
                                    id={`officer-${officer.id}`}
                                    checked={selectedFieldOfficers.includes(officer.id)}
                                    onChange={(e) => {
                                        const { checked } = e.target;
                                        setSelectedFieldOfficers((prev) =>
                                            checked
                                                ? [...prev, officer.id]
                                                : prev.filter((id) => id !== officer.id)
                                        );
                                    }}
                                >
                                    {`${officer.firstName} ${officer.lastName}`}
                                </Checkbox>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <Button onClick={() => setIsEditModalVisible(false)} className={styles.cancelButton}>Cancel</Button>
                    <Button onClick={handleAddFieldOfficer} className={styles.addModalButton}>Add</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Teams;
