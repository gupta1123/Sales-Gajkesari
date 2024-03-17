'use client'
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
// import { divIcon } from "leaflet";
import { format, formatDuration, intervalToDuration } from "date-fns";
import "./SalesExecutivePage.css";
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { FaStore, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaCircle } from 'react-icons/fa';
// import { LatLngExpression } from 'leaflet';
import { useSelector } from 'react-redux';
import { RootState } from '../store';


const SalesExecutivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("visits");
  const token = useSelector((state: RootState) => state.auth.token);
  const [activeVisit, setActiveVisit] = useState<{
    id: number;
    order: number;
    location: { lat: number; lng: number };
    startTime: Date;
    endTime: Date;
    customer: string;
    type: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null>(null);


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

  const attendanceStats = {
    totalDays: 30,
    present: 25,
    absent: 5,
  };

  const visitStats = {
    completed: 120,
    assigned: 150,
  };

  const getVisitCountForDate = (date: Date): { completed: number; assigned: number } => {
    // Implement logic to get the visit count for a specific date
    // Return an object with completed and assigned visit counts
    return {
      completed: 3,
      assigned: 5,
    };
  };

  const todaysVisits: {
    id: number;
    order: number;
    location: { lat: number; lng: number };
    startTime: Date;
    endTime: Date;
    customer: string;
    type: string;
  }[] = [
      {
        id: 1,
        order: 1,
        location: { lat: 37.7749, lng: -122.4194 },
        startTime: new Date("2023-06-10T09:30:00"),
        endTime: new Date("2023-06-10T10:15:00"),
        customer: "ABC Company",
        type: "Sales Meeting",
      },
      // ...
    ];


  // const visitTrail: LatLngExpression[] = todaysVisits.map(
  //   (visit) => [visit.location.lat, visit.location.lng] as LatLngExpression
  // );

  // const customMarkerIcon = (order: number, isActive: boolean) =>
  //   divIcon({
  //     className: `custom-marker ${isActive ? "active" : ""}`,
  //     html: `<div class="marker-icon">${order}</div>`,
  //   });

  const handleVisitClick = (visit: {
    id: number;
    order: number;
    location: { lat: number; lng: number };
    startTime: Date;
    endTime: Date;
    customer: string;
    type: string;
  }) => {
    setActiveVisit(visit);
  };



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/employee/getById?id=2", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: {
          firstName: string;
          lastName: string;
          email: string;
          role: string;
        } = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);



  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Sales Executive Dashboard</h1>
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
                    <h3 className="text-xl font-semibold">{userData?.firstName} {userData?.lastName}</h3>
                    <p className="text-gray-500">{userData?.email}</p>
                    <p className="text-gray-500">{userData?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md rounded-lg p-6">
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
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="bg-white shadow-md rounded-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-100 rounded-t-lg">
                  <TabsTrigger value="visits" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 focus:outline-none">
                    Visits
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 focus:outline-none">
                    Attendance
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="visits" className="p-6">
                  {/* <div className="map-container rounded-lg shadow-inner mb-8">
                    <MapContainer
                      key={activeVisit ? activeVisit.id : 'default'}
                      center={activeVisit ? [activeVisit.location.lat, activeVisit.location.lng] as LatLngExpression : [37.7749, -122.4194] as LatLngExpression}
                      zoom={activeVisit ? 17 : 12}
                      style={{ height: "400px" }}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                        maxZoom={20}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      {todaysVisits.map((visit) => (
                        <Marker
                          key={visit.id}
                          position={[visit.location.lat, visit.location.lng]}
                          icon={customMarkerIcon(visit.order, visit === activeVisit)}
                          eventHandlers={{
                            click: () => handleVisitClick(visit),
                          }}
                        >
                          <CustomPopup
                            className="custom-popup"
                          >
                            <div>
                              <strong>{visit.customer}</strong>
                              <br />
                              Duration: {formatDuration(intervalToDuration({ start: visit.startTime, end: visit.endTime }))}
                              <br />
                              Time: {format(visit.startTime, "hh:mm a")} - {format(visit.endTime, "hh:mm a")}
                              <br />
                              Type: {visit.type}
                            </div>
                          </CustomPopup>
                        </Marker>
                      ))}
                      <Polyline positions={visitTrail} pathOptions={{ color: "#3B82F6", weight: 4, opacity: 0.7 }} />
                    </MapContainer>
                  </div> */}
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Visit Details</h4>
                    <div className="space-y-6">
                      {todaysVisits.map((visit) => (
                        <div
                          key={visit.id}
                          className={`bg-gray-100 rounded-lg p-4 cursor-pointer ${visit === activeVisit ? "bg-blue-100" : ""
                            }`}
                          onClick={() => handleVisitClick(visit)}
                        >
                          <div className="text-lg font-semibold">{visit.customer}</div>
                          <div className="text-gray-500">
                            Duration: {formatDuration(intervalToDuration({ start: visit.startTime, end: visit.endTime }))}
                          </div>
                          <div className="text-gray-500">
                            Time: {format(visit.startTime, "hh:mm a")} - {format(visit.endTime, "hh:mm a")}
                          </div>
                          <div className="text-gray-500">Type: {visit.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="attendance" className="p-6">
                  {/* Add attendance details */}
                </TabsContent>
                <TabsContent value="attendance" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                      <h3 className="text-xl font-semibold mb-4">Attendance Stats</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                          <p className="text-lg font-semibold">Present: {attendanceStats.present}</p>
                        </div>
                        <div className="flex items-center">
                          <FaCircle className="text-red-500 w-6 h-6 mr-2" />
                          <p className="text-lg font-semibold">Absent: {attendanceStats.absent}</p>
                        </div>
                        <p className="text-gray-500">
                          Total Days: {attendanceStats.totalDays}
                        </p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-semibold mb-4">Visit Calendar</h3>
                      <Calendar
                        value={selectedDate}
                        onChange={(value, event) => setSelectedDate(value as Date)}
                        tileContent={({ date }) => {
                          const visitCount = getVisitCountForDate(date);
                          return (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">
                                Completed: {visitCount.completed}
                              </p>
                              <p className="text-xs text-gray-500">
                                Assigned: {visitCount.assigned}
                              </p>
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesExecutivePage;