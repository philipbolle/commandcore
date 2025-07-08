import { supabase } from "../utils/supabaseClient";

export async function getProducts() {
    // First, let's check if we can connect to Supabase at all
    try {
        const { data: testData, error: testError } = await supabase
            .from("products")
            .select("count")
            .limit(1);
            
        if (testError) {
            console.error("Connection failed:", testError);
            return [];
        }
    } catch (err) {
        console.error("Supabase connection error:", err);
        return [];
    }

    // Now let's try the actual query
    try {
        const { data, error, count } = await supabase
            .from("products")
            .select("*", { count: "exact" })
            .order("id", { ascending: true });

        if (error) {
            console.error("Supabase fetch error:", error);
            return [];
        }

        // Additional validation
        if (!data) {
            return [];
        }

        // Check if data is an empty array (this could indicate RLS issues, no data, etc.)
        if (Array.isArray(data) && data.length === 0) {
            console.error("Data is an empty array - possible issues: no data in table, RLS blocking access, wrong table name, or permission issues");
        }

        return data;
    } catch (err) {
        console.error("Unexpected error in getProducts:", err);
        return [];
    }
}

export async function getProductsWithDebug() {
    console.log("Calling getProductsWithDebug...");
    
    // First, let's check if we can connect to Supabase at all
    try {
        const { data: testData, error: testError } = await supabase
            .from("products")
            .select("count")
            .limit(1);
            
        console.log("Connection test - data:", testData);
        console.log("Connection test - error:", testError);
        
        if (testError) {
            console.error("Connection failed:", testError);
            return [];
        }
    } catch (err) {
        console.error("Supabase connection error:", err);
        return [];
    }

    // Now let's try the actual query with more debugging
    try {
        const { data, error, count } = await supabase
            .from("products")
            .select("*", { count: "exact" })
            .order("id", { ascending: true });

        console.log("Query result - data:", data);
        console.log("Query result - error:", error);
        console.log("Query result - count:", count);
        console.log("Data type:", typeof data);
        console.log("Data length:", data?.length);

        if (error) {
            console.error("Supabase fetch error:", error);
            return [];
        }

        // Additional validation
        if (!data) {
            console.log("Data is null/undefined");
            return [];
        }

        if (Array.isArray(data) && data.length === 0) {
            console.log("Data is an empty array - this might indicate:");
            console.log("1. No data in the table");
            console.log("2. RLS (Row Level Security) blocking access");
            console.log("3. Wrong table name");
            console.log("4. Permission issues");
        }

        return data;
    } catch (err) {
        console.error("Unexpected error in getProducts:", err);
        return [];
    }
}

// Alternative function to test with different approaches
export async function getProductsAlternative() {
    console.log("Calling getProductsAlternative...");
    
    // Try without ordering first
    const { data, error } = await supabase
        .from("products")
        .select("*");
        
    console.log("Alternative query result:", data);
    console.log("Alternative query error:", error);
    
    return data ?? [];
}
