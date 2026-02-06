"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushToRole } from "./notifications";

export async function triggerPanic() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Get user zone for context
    const { data: userData } = await supabase
        .from("users")
        .select("assigned_zone_id")
        .eq("id", user.id)
        .single();

    const { data, error } = await supabase.from("panic_alerts").insert({
        user_id: user.id,
        zone_id: userData?.assigned_zone_id,
        created_at: new Date().toISOString(),
    }).select("id").single();

    if (error) return { error: error.message };

    // Trigger FCM
    // Notify all captains
    await sendPushToRole("captain", "🚨 ALERTA DE PÁNICO 🚨", "Un mediador ha solicitado ayuda urgente.", {
        alertId: data.id,
        zoneId: userData?.assigned_zone_id || "unknown"
    });

    return { success: true, alertId: data.id };
}

export async function resolvePanic(alertId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Resolve ALL active alerts for this user (cleans up any backlog from multiple clicks)
    const { error } = await supabase
        .from("panic_alerts")
        .update({ resolved_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("resolved_at", null);

    if (error) return { error: error.message };

    revalidatePath("/captain");
    return { success: true };
}

export async function getActivePanic() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from("panic_alerts")
        .select("id")
        .eq("user_id", user.id)
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return data;
}
