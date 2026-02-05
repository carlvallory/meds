import DashboardLayout from "./layout-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Disponible en Zona</div>
            <p className="text-xs text-muted-foreground">Asignado a: Entrada Principal</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Placeholder buttons for next task */}
          <div className="bg-yellow-100 p-6 rounded-lg border border-yellow-200 text-center">
            <span className="block text-2xl mb-2">☕</span>
            <span className="font-bold text-yellow-800">Break</span>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 text-center">
            <span className="block text-2xl mb-2">🚽</span>
            <span className="font-bold text-gray-800">No Disponible</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
