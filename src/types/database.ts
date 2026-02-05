export type AppRole = 'admin' | 'captain' | 'mediator';

export interface Zone {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

export interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: AppRole;
    assigned_zone_id: string | null;
    is_active: boolean;
    last_seen: string | null;
    created_at: string;
}

export interface StatusLog {
    id: string;
    user_id: string;
    type: 'break' | 'unavailable';
    reason_id: string | null;
    start_time: string;
    end_time: string | null;
    duration_minutes: number | null;
}
