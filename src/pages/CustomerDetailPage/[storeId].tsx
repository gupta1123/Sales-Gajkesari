'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Phone, Mail, MapPin, ShoppingBag, Users, Flag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VisitsTimeline from "../VisitsTimeline"
import NotesSection from "../../components/NotesSection"
import BrandsSection from "../../components/BrandsSection"
import LikesSection from "../../components/LikesSection"
import { Button } from "@/components/ui/button"
import TimelineOverview from "../../components/TimelineOverview"
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Updated import path

interface CustomerData {
  storeId?: string;
  storeName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  monthlySale?: string;
  intentLevel?: string;
  fieldOfficer?: string;
  clientType?: string;
  clientFirstName?: string;
  clientLastName?: string;
  primaryContact?: string;
  secondaryContact?: string;
  email?: string;
  industry?: string;
  companySize?: number;
  gstNumber?: string;
  latitude?: number;
  longitude?: number;
  managers?: string[];
  brandsInUse?: string[];
  brandProCons?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const dummyData = {
  shopName: "Acme Store",
  location: "New York, USA",
  address: "123 Main St, New York, NY 10001",
  ownerName: "John Doe",
  phone: "+1 123-456-7890",
  monthlySales: "$50,000",
  intentLevel: "8",
  fieldOfficer: "Jane Smith",
  clientType: "Shop",
}
export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState<"visits" | "notes" | "TimelineOverview">("visits");
  const [activeTab1, setActiveTab1] = useState<"Brands" | "Likes">("Brands");
  const router = useRouter();
  const { storeId } = router.query as { storeId?: string };
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [othersValue, setOthersValue] = useState<string>("");
  const [customClientType, setCustomClientType] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  const handleEdit = () => {
    setIsEditing(true);
  };




  const handleSave = async () => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/edit?id=${storeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          managers: customerData.managers || [],
          latitude: customerData.latitude || 0,
          longitude: customerData.longitude || 0,
          brandsInUse: customerData.brandsInUse || [],
          monthlySale: customerData.monthlySale || "",
          brandProCons: customerData.brandProCons || [],
          notes: customerData.notes || null,
          clientType: customClientType || customerData.clientType || "",
          createdAt: customerData.createdAt || "",
          updatedAt: customerData.updatedAt || "",
          storeId: storeId,
          storeName: customerData.storeName || "",
          clientFirstName: customerData.clientFirstName || "",
          clientLastName: customerData.clientLastName || "",
          primaryContact: customerData.primaryContact || "",
          secondaryContact: customerData.secondaryContact || "",
          email: customerData.email || "",
          industry: customerData.industry || "",
          companySize: customerData.companySize || 0,
          gstNumber: customerData.gstNumber || "",
          addressLine1: customerData.addressLine1 || "",
          addressLine2: customerData.addressLine2 || "",
          city: customerData.city || "",
          state: customerData.state || "",
          country: customerData.country || "",
          pincode: customerData.pincode || "",
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Optionally, you can refresh the customer data after successful update
        // fetchCustomerData();
      } else {
        console.error("Error updating customer:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };


  const handleInputChange = (field: keyof CustomerData, value: string | number) => {
    setCustomerData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/getById?id=${storeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: CustomerData = await response.json();
        setCustomerData(data);
        setIsLoading(false);
      } catch (error) {
        setError('Customer not found!');
        setIsLoading(false);
      }
    };

    if (storeId && token) {
      fetchCustomerData();
    }
  }, [storeId, token]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!customerData) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Customer Detail</h1>

      {/* Top Section */}
      <div className="bg-white rounded-lg shadow-lg px-8 py-6 mb-8">
        <div className="flex items-center">
          <div className="flex items-center">
            <Avatar className="w-16 h-16 rounded-full ring-2 ring-offset-2 ring-indigo-500">
            </Avatar>

            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">{customerData.storeName}</h2>
              <div className="flex items-center text-gray-500">
                <MapPin className="mr-1 w-4 h-4" />
                <span className="text-sm font-medium">{customerData.addressLine1}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-8">
            <div className="flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <ShoppingBag className="text-indigo-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Monthly Sales</p>
                <p className="text-xl font-semibold text-gray-800">{customerData.monthlySale}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Users className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Client Type</p>
                <p className="text-xl font-semibold text-gray-800">{customerData.clientType}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <Flag className="text-yellow-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Intent Level</p>
                <p className="text-xl font-semibold text-gray-800">{customerData.intentLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-white rounded-lg shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Customer Information</h2>
            <Button onClick={isEditing ? handleSave : handleEdit} className="text-indigo-500">
              {isEditing ? "Save" : <Edit />}
            </Button>
          </div>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shopName" className="block text-gray-700 font-medium mb-1">
                      Shop Name
                    </label>
                    <Input
                      id="shopName"
                      type="text"
                      value={customerData.storeName}
                      onChange={(e) => handleInputChange("storeName", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location1" className="block text-gray-700 font-medium mb-1">
                        Latitude
                      </label>
                      <Input id="location1" type="text" className="w-full" />
                    </div>
                    <div>
                      <label htmlFor="location2" className="block text-gray-700 font-medium mb-1">
                        Longitude
                      </label>
                      <Input id="location2" type="text" className="w-full" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
                      Address
                    </label>
                    <Input
                      id="address"
                      type="text"
                      value={customerData.addressLine1}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                      className="w-full mb-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-gray-700 font-medium mb-1">
                          City
                        </label>
                        <Input id="city" type="text" className="w-full" />
                      </div>
                      <div>
                        <label htmlFor="pincode" className="block text-gray-700 font-medium mb-1">
                          Pincode
                        </label>
                        <Input id="pincode" type="text" className="w-full" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ownerName" className="block text-gray-700 font-medium mb-1">
                      Owner Name
                    </label>
                    <Input
                      id="ownerName"
                      type="text"
                      value={customerData.clientFirstName}
                      onChange={(e) => handleInputChange("clientFirstName", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.primaryContact}
                      onChange={(e) => handleInputChange("primaryContact", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Info</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="monthlySales" className="block text-gray-700 font-medium mb-1">
                      Monthly Sales
                    </label>
                    <Input
                      id="monthlySales"
                      type="text"
                      value={customerData.monthlySale}
                      onChange={(e) => handleInputChange("monthlySale", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="intentLevel" className="block text-gray-700 font-medium mb-1">
                      Intent Level
                    </label>
                    <Select
                      value={customerData.intentLevel}
                      onValueChange={(value) => handleInputChange("intentLevel", value)}
                    >
                      <SelectTrigger id="intentLevel" className="w-full">
                        <SelectValue placeholder="Select intent level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, index) => (
                          <SelectItem key={index} value={String(index + 1)}>
                            {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="fieldOfficer" className="block text-gray-700 font-medium mb-1">
                      Field Officer
                    </label>
                    <Input
                      id="fieldOfficer"
                      type="text"
                      value={customerData.fieldOfficer}
                      onChange={(e) => handleInputChange("fieldOfficer", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="clientType" className="block text-gray-700 font-medium mb-1">
                      Client Type
                    </label>
                    <Select
                      value={customerData.clientType}
                      onValueChange={(value) => {
                        handleInputChange("clientType", value);
                        if (value === "others") {
                          setCustomClientType("");
                        } else {
                          setCustomClientType(null);
                        }
                      }}
                    >
                      <SelectTrigger id="clientType" className="w-full">
                        <SelectValue placeholder="Select client type">        {customClientType || customerData.clientType}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    {customerData.clientType === "others" && (
                      <div className="mt-2">
                        <label htmlFor="customClientType" className="block text-gray-700 font-medium mb-1">
                          Please specify:
                        </label>
                        <textarea
                          id="customClientType"
                          value={customClientType || ""}
                          onChange={(e) => setCustomClientType(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          rows={3}
                        ></textarea>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="companySize" className="block text-gray-700 font-medium mb-1">
                      Company Size
                    </label>
                    <Input
                      id="companySize"
                      type="number"
                      value={customerData.companySize}
                      onChange={(e) => handleInputChange("companySize", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="gstNumber" className="block text-gray-700 font-medium mb-1">
                      GST Number
                    </label>
                    <Input
                      id="gstNumber"
                      type="text"
                      value={customerData.gstNumber}
                      onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine2" className="block text-gray-700 font-medium mb-1">
                      Address Line 2
                    </label>
                    <Input
                      id="addressLine2"
                      type="text"
                      value={customerData.addressLine2}
                      onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-gray-700 font-medium mb-1">
                      State
                    </label>
                    <Input
                      id="state"
                      type="text"
                      value={customerData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-gray-700 font-medium mb-1">
                      Country
                    </label>
                    <Input
                      id="country"
                      type="text"
                      value={customerData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Shop Name</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.storeName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.addressLine1}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Owner Name</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.clientFirstName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.primaryContact}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Monthly Sales</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.monthlySale}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Intent Level</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.intentLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Field Officer</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.fieldOfficer}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Client Type</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.clientType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Industry</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.industry}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Company Size</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.companySize}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">GST Number</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address Line 2</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.addressLine2}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">State</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Country</p>
                    <p className="text-lg font-medium text-gray-800">{customerData.country}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Tabs */}

      <div className="bg-white rounded-lg shadow-lg">
        <Tabs defaultValue="Brands" value={activeTab1} onValueChange={(value) => setActiveTab1(value as "Brands" | "Likes")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Brands" className="px-4 py-2">Brands Used</TabsTrigger>
            <TabsTrigger value="Likes" className="px-4 py-2">Likes</TabsTrigger>
          </TabsList>


          {/* BrandsSection Tab */}
          <TabsContent value="Brands" className="p-6">
            <BrandsSection storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* LikesSection Tab */}
          <TabsContent value="Likes" className="p-6">
            <LikesSection storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

        </Tabs>
      </div>

      <br />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "visits" | "notes" | "TimelineOverview")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="TimelineOverview" className="px-4 py-2">Overview</TabsTrigger>
            <TabsTrigger value="visits" className="px-4 py-2">Visits</TabsTrigger>
            <TabsTrigger value="notes" className="px-4 py-2">Notes</TabsTrigger>

          </TabsList>


          {/* Timeline Tab */}
          <TabsContent value="TimelineOverview" className="p-6">
            <TimelineOverview storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="p-6">
            <VisitsTimeline storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="p-6">
            <NotesSection storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
