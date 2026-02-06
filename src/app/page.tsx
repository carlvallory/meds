import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "./layout-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StatusControl from "@/components/status-control";
import PanicButton from "@/components/panic-button";
import { getReasons } from "./actions/status";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get My Current Active Log
  const { data: activeLog } = await supabase
    .from("status_logs")
    .select("*")
    .eq("user_id", user.id)
    .is("end_time", null)
    .single();

  // 2. Determine Logic Status
  let currentStatus: "available" | "break" | "unavailable" = "available";
  if (activeLog) {
    if (activeLog.type === "break") currentStatus = "break";
    if (activeLog.type === "unavailable") currentStatus = "unavailable";
  }

  // 3. Get User Zone Info
  const { data: userData } = await supabase
    .from("users")
    .select("*, zones(name)")
    .eq("id", user.id)
    .single();

  const zoneName = userData?.role === 'host' ? "Host de Piso (Sin Zona)" : (userData?.zones?.name || "Sin Asignar");

  // 4. Get Reasons for Unavailable
  const reasons = await getReasons();

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentStatus === 'available' ? 'text-green-600' : 'text-gray-600'}`}>
              {currentStatus === 'available' ? 'Disponible' : (currentStatus === 'break' ? 'En Break' : 'No Disponible')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Zona: <span className="font-semibold text-gray-900">{zoneName}</span></p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Control de Estado</h2>
        <StatusControl
          currentStatus={currentStatus}
          startTime={activeLog?.start_time}
          reasons={reasons}
        />

        <PanicButton />
      </div>
    </DashboardLayout>
  );
}
