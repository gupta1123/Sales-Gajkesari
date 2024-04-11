// types.ts
export interface Visit {
    id: string;
    storeName: string;
    employeeName: string;
    visit_date: string;
    purpose: string;
    outcome: string;
    feedback?: string;
    location: string;
    checkinDate?: string | null;
    checkinTime?: string | null;
    checkoutDate?: string | null;
    checkoutTime?: string | null;
    visitStart?: string | null;
    visitEnd?: string | null;
    intent?: string | null;
    city?: string | null;
    state?: string | null;
}