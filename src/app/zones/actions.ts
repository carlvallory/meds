"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createZone(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const supabase = await createClient();

    // Validate roles? Middleware handles route protection, but we can double check
    // Ideally, RLS prevents insertion if not admin/captain
    const { error } = await supabase.from("zones").insert({
        name,
        description,
        is_active: true,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/zones");
    return { success: true };
}

export async function updateZone(id: string, name: string, description: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("zones")
        .update({ name, description, is_active: isActive })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/zones");
    return { success: true };
}

export async function toggleZoneStatus(id: string, currentStatus: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("zones")
        .update({ is_active: !currentStatus })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }
    revalidatePath("/zones");
    return { success: true };
}
