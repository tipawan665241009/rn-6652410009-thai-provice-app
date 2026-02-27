export type Category = 'tourism' | 'restaurant' | 'cafe' | 'temple' | 'festival';

export interface Place {
    id: string;
    category: Category;
    name: string;
    address: string;
    phone?: string;
    latitude: number;
    longitude: number;
    image_path: string;
    description?: string;
    date?: string; // For festivals
}
