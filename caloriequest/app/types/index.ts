// shape of data on the frontend get food info
export interface Nutriments {
    'energy-kcal_100g'?: number | null;
    'fat_100g'?: number | null;
    'carbohydrates_100g'?: number | null;
    'proteins_100g'?: number | null;
}

export interface FoodProduct {
    code: string;
    product_name: string;
    image_url?: string | null;
    brand?: string | null;
    quantity?: string | null;
    serving_size?: string | null;
    nutriments: Nutriments;
}