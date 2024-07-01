import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import './VisitsTimeline.css';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Visit {
  id: string;
  visit_date: string;
  purpose: string;
  storeName: string;
  employeeName: string;
  feedback?: string;
}

export default function VisitsTimeline({ storeId }: { storeId: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (storeId && token) {
      fetchVisits();
    }
  }, [storeId, token]);

  const fetchVisits = async () => {
    try {
      const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/visit/getByStore?id=${storeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: Visit[] = await response.json();
    
      const sortedVisits = data.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
      setVisits(sortedVisits);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch visits.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading visits...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visits Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="timeline">
          {visits.map((visit) => (
            <div key={visit.id} className="timeline-item">
              <div className="timeline-point"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div className="timeline-date">{visit.visit_date}</div>
                  <Link href={`/VisitDetailPage/[id]`} as={`/VisitDetailPage/${visit.id}`} passHref>
                    <div className="timeline-visit-id">Visit ID: {visit.id}</div>
                  </Link>
                </div>
                <div className="timeline-title">{visit.purpose}</div>
                <div className="timeline-description">
                  <p>Store: {visit.storeName}</p>
                  <p>Employee: {visit.employeeName}</p>
                  {visit.feedback && <p>Feedback: {visit.feedback}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
