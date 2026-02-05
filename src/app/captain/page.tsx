import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "../layout-dashboard";
import LiveDashboardTable from "@/components/live-dashboard";
import { redirect } from "next/navigation";

export default async function CaptainDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Check role? In middleware we might not enforce strictly yet, but here we can check DB role
    // For MVP assume role check is done via UI hiding or DB policies.

    // Fetch Mediators + Zones
    const { data: users } = await supabase
        .from("users")
        .select("*, zones(name)")
        .neq("role", "admin") // Show everyone except admin? or just filtered
        .eq("is_active", true)
        .order("full_name");

    // Fetch Active Logs for these users
    // We can't easily join on "active log" in one query without a View or complex query.
    // We'll fetch active logs separately and merge in JS.
    const { data: activeLogs } = await supabase
        .from("status_logs")
        .select("*")
        .is("end_time", null);

    const mergedData = users?.map(u => ({
        ...u,
        active_log: activeLogs?.find(l => l.user_id === u.id) || null
    })) || [];

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tablero de Control</h1>
                    <p className="text-muted-foreground">Monitoreo de mediadores en tiempo real.</p>
                </div>
            </div>

            <LiveDashboardTable initialMediators={mergedData} />

        </DashboardLayout>
    );
}
