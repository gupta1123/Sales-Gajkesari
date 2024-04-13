'use client';
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDuration, intervalToDuration } from "date-fns";
import "./SalesExecutivePage.css";
import { FaStore, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import DateRange from '../DateRange';
import { useRouter } from 'next/router';

interface Visit {
  id: number;
  storeId: number;
  storeName: string;
  storeLatitude: number;
  storeLongitude: number;
  employeeId: number;
  employeeName: string;
  visit_date: string;
  intent: number | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  visitLatitude: number | null;
  visitLongitude: number | null;
  checkinLatitude: number | null;
  checkinLongitude: number | null;
  checkoutLatitude: number | null;
  checkoutLongitude: number | null;
  checkinDate: string | null;
  checkoutDate: string | null;
  checkinTime: string | null;
  checkoutTime: string | null;
  purpose: string;
  outcome: string | null;
  feedback: string | null;
  createdAt: string | null;
  createdTime: string | null;
  updatedAt: string | null;
  updatedTime: string | null;
}

const SalesExecutivePage: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [employeeData, setEmployeeData] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);

  const router = useRouter();
  const { id } = router.query;

  const userInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/path/to/avatar.jpg",
    role: "Sales Executive",
  };

  const stats = {
    stores: 50,
    visitsThisMonth: 120,
    visitsToday: 5,
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/employee/getById?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: {
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          role: string;
        } = await response.json();
        setEmployeeData(data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    if (token && id) {
      fetchEmployeeData();
    }
  }, [token, id]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-white shadow-md rounded-lg p-6 mb-8">
              <CardContent>
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src={userInfo.avatar} alt="User Avatar" />
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{employeeData?.firstName} {employeeData?.lastName}</h3>
                    <p className="text-gray-500">{employeeData?.email}</p>
                    <p className="text-gray-500">{employeeData?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <Card className="bg-white shadow-md rounded-lg p-6">
              <CardContent>
                <h2 className="text-2xl font-semibold mb-6">KPIs</h2>
                <div className="space-y-4">
                  <div className="bg-blue-500 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">Stores Visited</p>
                      <p className="text-3xl font-bold text-white">{stats.stores}</p>
                    </div>
                    <FaStore className="text-white w-12 h-12" />
                  </div>
                  <div className="bg-green-500 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">Visits This Month</p>
                      <p className="text-3xl font-bold text-white">{stats.visitsThisMonth}</p>
                    </div>
                    <FaCalendarAlt className="text-white w-12 h-12" />
                  </div>
                  <div className="bg-yellow-500 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">Visits Today</p>
                      <p className="text-3xl font-bold text-white">{stats.visitsToday}</p>
                    </div>
                    <FaMapMarkerAlt className="text-white w-12 h-12" />
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
          <div className="md:col-span-2">
            <Card className="bg-white shadow-md rounded-lg p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <DateRange setVisits={setVisits} />
                </div>
                <div className="space-y-6">
                  {visits.map((visit) => {
                    let status = 'Assigned';
                    let statusColor = 'bg-blue-100 text-blue-800';
                    let statusEmoji = ' ';

                    if (visit.checkinDate && visit.checkinTime && visit.checkoutDate && visit.checkoutTime) {
                      status = 'Completed';
                      statusColor = 'bg-purple-100 text-purple-800';
                      statusEmoji = ' ';
                    } else if (visit.checkoutDate && visit.checkoutTime) {
                      status = 'Checked Out';
                      statusColor = 'bg-orange-100 text-orange-800';
                      statusEmoji = ' ';
                    } else if (visit.checkinDate && visit.checkinTime) {
                      status = 'On Going';
                      statusColor = 'bg-green-100 text-green-800';
                      statusEmoji = ' ';
                    }

                    return (
                      <Card key={visit.id} className="bg-white shadow-md rounded-lg p-4">
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-lg font-semibold">{visit.storeName}</div>
                            <div className="flex flex-col items-end">
                              <Badge className={`${statusColor} px-3 py-1 rounded-full font-semibold mb-2`}>
                                {statusEmoji} {status}
                              </Badge>
                              {status === 'On Going' && visit.checkinDate && visit.checkinTime && (
                                <div className="text-gray-500 text-sm">
                                  Check-in: {format(new Date(`${visit.checkinDate} ${visit.checkinTime}`), "d MMM h:mm a")}
                                </div>
                              )}
                              {status === 'Completed' && (
                                <>
                                  {visit.checkinDate && visit.checkinTime && (
                                    <div className="text-gray-500 text-sm">
                                      Check-in: {format(new Date(`${visit.checkinDate} ${visit.checkinTime}`), "d MMM h:mm a")}
                                    </div>
                                  )}
                                  {visit.checkoutDate && visit.checkoutTime && (
                                    <div className="text-gray-500 text-sm">
                                      Check-out: {format(new Date(`${visit.checkoutDate} ${visit.checkoutTime}`), "d MMM h:mm a")}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-gray-500">Employee: {visit.employeeName}</div>
                          {visit.scheduledStartTime && visit.scheduledEndTime && (
                            <div className="text-gray-500">
                              Duration: {formatDuration(intervalToDuration({ start: new Date(visit.scheduledStartTime), end: new Date(visit.scheduledEndTime) }))}
                            </div>
                          )}
                          <div className="text-gray-500">Purpose: {visit.purpose}</div>
                          {visit.intent !== null && (
                            <div className="text-gray-500">Intent Level: {visit.intent}</div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesExecutivePage;