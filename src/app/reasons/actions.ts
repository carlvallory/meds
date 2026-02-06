"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReason(formData: FormData) {
    const label = formData.get("label") as string;
    const supabase = await createClient();

    const { error } = await supabase.from("availability_reasons").insert({
        reason_label: label,
        is_active: true,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/reasons");
    return { success: true };
}

export async function deleteReason(id: string) {
    const supabase = await createClient();
    // Soft delete usually better, but for MVP hard delete or toggle active
    const { error } = await supabase
        .from("availability_reasons")
        .update({ is_active: false })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/reasons");
    return { success: true };
}
