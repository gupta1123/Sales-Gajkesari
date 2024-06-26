import React from 'react';
import { useRouter } from 'next/router';

interface EmployeeCardProps {
    employeeName: string;
    totalVisits: number;
    onClick: () => void;
}

const EmployeeCard1 = ({ employeeName, totalVisits, onClick }: EmployeeCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        sessionStorage.setItem('previousPage', 'EmployeeCard1');
        onClick();
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105" onClick={handleClick}>
            <h2 className="text-2xl font-bold mb-4 capitalize">{employeeName}</h2>
            <div className="flex justify-between">
                <p className="text-gray-600">Total Visits: <span className="font-bold">{totalVisits}</span></p>
            </div>
        </div>
    );
};

export default EmployeeCard1;
