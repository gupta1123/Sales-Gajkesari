'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Upload, message } from "antd";
import { InboxOutlined, CaretDownOutlined, PushpinOutlined } from "@ant-design/icons";
import VisitsTimeline from "../VisitsTimeline";
import NotesSection from "../../components/NotesSection";
import PerformanceMetrics from "../../components/PerformanceMetrics";
import "../VisitDetail.css";
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Updated import path
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { UploadProps, UploadFile } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';

const { Dragger } = Upload;

interface VisitData {
  id?: number;
  storeId?: number;
  storeName?: string;
  storeLatitude?: number;
  storeLongitude?: number;
  employeeId?: number;
  employeeName?: string;
  visit_date?: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  visitLatitude?: number | null;
  visitLongitude?: number | null;
  checkinLatitude?: number | null;
  checkinLongitude?: number | null;
  checkoutLatitude?: number | null;
  checkoutLongitude?: number | null;
  checkinDate?: string | null;
  checkoutDate?: string | null;
  checkinTime?: string | null;
  checkoutTime?: string | null;
  purpose?: string;
  outcome?: string | null;
  feedback?: string | null;
  createdAt?: string | null;
  createdTime?: string | null;
  updatedAt?: string | null;
  updatedTime?: string | null;
}

const VisitDetailPage = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [visitStatus, setVisitStatus] = useState("pending");
  const [images, setImages] = useState<UploadFile<any>[]>([]);
  const router = useRouter();
  const { id } = router.query;
  const [visit, setVisit] = useState<VisitData | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const [checkInStatus, setCheckInStatus] = useState<'Assigned' | 'Checked In' | 'Checked Out' | 'Completed'>('Assigned');

  useEffect(() => {
    const fetchVisitDetails = async () => {
      try {
        const response = await axios.get(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/visit/getById?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          setVisit(response.data);
          console.log(visit);

          // Update the check-in/check-out status based on the visit data
          if (
            response.data.checkinDate &&
            response.data.checkinTime &&
            response.data.checkinLongitude &&
            response.data.checkinLatitude &&
            response.data.checkoutDate &&
            response.data.checkoutTime &&
            response.data.checkoutLongitude &&
            response.data.checkoutLatitude
          ) {
            setCheckInStatus('Completed');
          } else if (response.data.checkoutTime && response.data.checkoutLongitude && response.data.checkoutLatitude && response.data.checkoutDate) {
            setCheckInStatus('Checked Out');
          } else if (response.data.checkinTime && response.data.checkinLongitude && response.data.checkinLatitude && response.data.checkinDate) {
            setCheckInStatus('Checked In');
          } else {
            setCheckInStatus('Assigned');
          }
        }
      } catch (error) {
        console.error('Error fetching visit details:', error);
      }
    };

    if (id && token) {
      fetchVisitDetails();
    }
  }, [id, token]);

  const handleImageUpload = (info: UploadChangeParam<UploadFile<any>>) => {
    const { status } = info.file;
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
      setImages([...images, info.file]);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange: handleImageUpload,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'canceled':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCheckInStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'text-sky-500';
      case 'Checked In':
        return 'text-lime-500';
      case 'Checked Out':
        return 'text-amber-500';
      case 'Completed':
        return 'text-fuchsia-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Visit Detail</h1>

      {/* Display the check-in/check-out status */}
      <div className="mb-8">
        <span className={`text-2xl font-semibold ${getCheckInStatusColor(checkInStatus)}`}>
          {checkInStatus}
        </span>
        {visit?.checkinDate && visit?.checkinTime && (
          <div className="mt-2">
            <span className="text-gray-500">Check-In:</span>{' '}
            <span className="font-semibold">{visit.checkinDate} {visit.checkinTime}</span>
          </div>
        )}
        {visit?.checkoutDate && visit?.checkoutTime && (
          <div className="mt-2">
            <span className="text-gray-500">Check-Out:</span>{' '}
            <span className="font-semibold">{visit.checkoutDate} {visit.checkoutTime}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Visit Summary */}
          <Card className="mb-8">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Visit Summary</h2>
                  <p className="text-sm text-gray-500">Overview of the visit details</p>
                </div>
                <div>
                  <Select value={visitStatus} onValueChange={setVisitStatus}>
                    <SelectTrigger className="flex items-center space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(visitStatus)}`}></span>
                      <SelectValue placeholder="Select status" />
                      <CaretDownOutlined className="w-4 h-4 text-gray-500" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                        Pending
                      </SelectItem>
                      <SelectItem value="completed">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                        Completed
                      </SelectItem>
                      <SelectItem value="canceled">
                        <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                        Canceled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                    <p className="text-lg font-semibold">{visit?.visit_date}</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Purpose</p>
                    <p className="text-lg font-semibold">{visit?.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-semibold">{visit?.employeeName}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">Store</p>
                      <button className="text-sm text-blue-500 hover:underline focus:outline-none">View Store</button>
                    </div>
                    <p className="text-lg font-semibold">{visit?.storeName}</p>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <div className="flex items-center space-x-2">
                      <PushpinOutlined className="w-4 h-4 text-gray-500" />
                      <p className="text-lg font-semibold">{visit?.storeLatitude}, {visit?.storeLongitude}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Detailed notes and observations from the sales executive.</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Customer expressed interest in product X</li>
                <li>Discussed pricing and package options</li>
                <li>Identified key pain points and requirements</li>
              </ul>
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">Intent Level:</span>
                <span className="text-green-600">High</span>
              </div>
              <div className="mb-4">
                <p className="font-semibold mb-2">Action Items:</p>
                <ul className="list-disc pl-6">
                  <li>Prepare a custom proposal for the customer</li>
                  <li>Schedule a follow-up meeting next week</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Visit Images */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Visit Images</CardTitle>
            </CardHeader>
            <CardContent>
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other sensitive files.
                </p>
              </Dragger>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {/* Render visit images */}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics />
            </CardContent>
          </Card>
        </div>
        <div>
          {/* Previous Visits */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Previous Visits</CardTitle>
            </CardHeader>
            <CardContent>
              {visit && visit.storeId && <VisitsTimeline storeId={visit.storeId.toString()} />}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection storeId={visit?.storeId?.toString() ?? '0'} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisitDetailPage;