export interface Category {
    id: string;
    title: string;
    created_at?: string;
}

export interface Training {
    id: string;
    category_id: string;
    month_index: number;
    name: string;
    duration: string;
    youtube_id?: string;
    vimeo_id?: string;
    google_drive_id?: string;
    video_url?: string;
    materi?: string;
    pdf_path?: string;
    is_paid: boolean;
    price: number;
    date?: string;
    time?: string;
    certificate_template_id?: string;
    gas_url?: string;
    drive_folder_id?: string;
    certificate_folder_id?: string;
    registration_status?: 'open' | 'close';
    banner_url?: string;
    created_at?: string;
}

export interface Registration {
    id: string;
    training_id: string;
    user_id: string;
    nama: string;
    email: string;
    phone?: string;
    lembaga?: string;
    status?: 'pending' | 'valid' | 'invalid';
    certificate_url?: string;
    registered_at?: string;
}

export interface Assignment {
    id: string;
    registration_id: string;
    training_id: string;
    file_url: string;
    status: 'pending' | 'valid' | 'invalid';
    feedback?: string;
    validator_id?: string;
    created_at?: string;
}

export interface Profile {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    website?: string;
    role: string;
    updated_at: string;
    created_at?: string;
}

export interface AssignmentWithDetails extends Assignment {
    registrations: Registration | Registration[];
    trainings: Training | Training[];
    validator?: { full_name: string } | { full_name: string }[];
}
