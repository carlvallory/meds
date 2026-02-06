"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

    // Here we would trigger FCM (Firebase Cloud Messaging)
    // await sendPushNotificationToTopic("captains", "ALERTA: Mediador ha activado botón de pánico!");

    return { success: true, alertId: data.id };
}

export async function resolvePanic(alertId: string) {
    const supabase = await createClient();

    // Allow user to resolve their own panic (RLS must allow UPDATE for own rows)
    const { error } = await supabase
        .from("panic_alerts")
        .update({ resolved_at: new Date().toISOString() })
        .eq("id", alertId);

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
