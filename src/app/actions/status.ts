"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function startBreak() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // 1. Check if ANYONE is currently on break (Business Rule: Only 1 break at a time)
    const { data: activeBreaks } = await supabase
        .from("status_logs")
        .select("id")
        .eq("type", "break")
        .is("end_time", null)
        .limit(1);

    if (activeBreaks && activeBreaks.length > 0) {
        return { error: "Ya hay un mediador en break. Espera tu turno." };
    }

    // 2. Check if I am already in a status (cannot break if I am already unavailable/break)
    const { data: myActiveStatus } = await supabase
        .from("status_logs")
        .select("id")
        .eq("user_id", user.id)
        .is("end_time", null)
        .limit(1);

    if (myActiveStatus && myActiveStatus.length > 0) {
        return { error: "Ya tienes un estado activo. Finalízalo primero." };
    }

    // 3. Start Break
    const { error } = await supabase.from("status_logs").insert({
        user_id: user.id,
        type: "break",
        start_time: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
}

export async function endStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Find my active status (break or unavailable)
    const { data: myActiveStatus } = await supabase
        .from("status_logs")
        .select("id")
        .eq("user_id", user.id)
        .is("end_time", null)
        .single();

    if (!myActiveStatus) {
        return { error: "No tienes ningún estado activo para finalizar." };
    }

    // Close it
    const { error } = await supabase
        .from("status_logs")
        .update({ end_time: new Date().toISOString() })
        .eq("id", myActiveStatus.id);

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
}

export async function startUnavailable(reasonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Check if I am already in a status
    const { data: myActiveStatus } = await supabase
        .from("status_logs")
        .select("id")
        .eq("user_id", user.id)
        .is("end_time", null)
        .limit(1);

    if (myActiveStatus && myActiveStatus.length > 0) {
        return { error: "Ya tienes un estado activo. Finalízalo primero." };
    }

    // Start Unavailable
    const { error } = await supabase.from("status_logs").insert({
        user_id: user.id,
        type: "unavailable",
        reason_id: reasonId, // We assume reasons are pre-created by admin
        start_time: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
}

export async function getReasons() {
    const supabase = await createClient();
    const { data } = await supabase.from("availability_reasons").select("*").eq("is_active", true);
    return data || [];
}
