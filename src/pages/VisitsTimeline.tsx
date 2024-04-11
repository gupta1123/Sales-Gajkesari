import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import './VisitsTimeline.css';
import { RootState } from '../store';

interface Visit {
  id: string;
  visit_date: string;
  purpose: string;
  storeName: string;
  employeeName: string;
  feedback?: string;
  checkinDate?: string;
  checkoutDate?: string;
  intent?: number;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).toLowerCase();
  return `${day} ${month} ${time}`;
};

const getStatusProps = (visit: Visit) => {
  if (!visit.checkinDate && !visit.checkoutDate) {
    return { status: 'Assigned', icon: '📝', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
  } else if (visit.checkinDate && !visit.checkoutDate) {
    return { status: 'On Going', icon: '⏳', bgColor: 'bg-green-100', textColor: 'text-green-800' };
  } else if (visit.checkinDate && visit.checkoutDate) {
    return { status: 'Completed', icon: '✅', bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
  }
  return { status: 'Assigned', icon: '📝', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
};

export default function VisitsTimeline({ storeId }: { storeId: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchVisits = async () => {
      if (storeId && token) {
        try {
          const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/visit/getByStore?id=${storeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data: Visit[] = await response.json();
          setVisits(data);
          setIsLoading(false);
        } catch (error) {
          setError('Failed to fetch visits.');
          setIsLoading(false);
        }
      }
    };

    fetchVisits();
  }, [storeId, token]);

  if (isLoading) {
    return <div className="loading-indicator">Loading visits...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visits Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="visits-timeline">
          {visits.map((visit) => {
            const { status, icon, bgColor, textColor } = getStatusProps(visit);
            return (
              <div key={visit.id} className="visit-item">
                <div className={`visit-status ${bgColor} ${textColor}`}>
                  <span className="icon">{icon}</span>
                  <span>{status}</span>
                </div>
                <div className="visit-details">
                  <Link href={`/VisitDetailPage/[id]`} as={`/VisitDetailPage/${visit.id}`} passHref>
                    <div className="visit-id">
                     
                      <span>Visit ID: {visit.id}</span>
                    </div>
                  </Link>
                  <div className="visit-date">
                    <span className="icon">📅</span>
                    <span>{visit.visit_date}</span>
                  </div>
                  <div className="visit-purpose">
                  
                    <span>{visit.purpose}</span>
                  </div>
                  <div className="visit-store">
                   
                    <span>{visit.storeName}</span>
                  </div>
                  <div className="visit-employee">
                    <span className="icon">👤</span>
                    <span>{visit.employeeName}</span>
                  </div>
                  {visit.feedback && (
                    <div className="visit-feedback">
                      <span className="icon">💬</span>
                      <span>{visit.feedback}</span>
                    </div>
                  )}
                  <div className="visit-timeline-details">
                    {visit.checkinDate && (
                      <div className="visit-checkin">
                
                        <span>Check-In: {formatDate(visit.checkinDate)}</span>
                      </div>
                    )}
                    {visit.checkoutDate && (
                      <div className="visit-checkout">
                      
                        <span>Check-Out: {formatDate(visit.checkoutDate)}</span>
                      </div>
                    )}
                    {visit.intent && (
                      <div className="visit-intent">
                        <span className="icon">📈</span>
                        <span>Intent: {visit.intent}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}