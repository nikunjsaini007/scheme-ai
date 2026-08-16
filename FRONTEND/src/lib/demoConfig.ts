// Demo mode configuration for Yojantra
// This file controls whether the application uses demo data or real Supabase data

// Set this to true to enable demo mode with local mock data
// Set this to false to use real Supabase data
export const USE_DEMO_MODE = true;

// Demo mode indicator for UI display
export const DEMO_MODE_LABEL = "DEMO";

// Check if we're in demo mode
export const isDemoMode = () => USE_DEMO_MODE;
