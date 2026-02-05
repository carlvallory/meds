import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DashboardLayout from "../layout-dashboard";
import { CreateZoneDialog } from "./create-zone-dialog";

export default async function ZonesPage() {
    const supabase = await createClient();
    const { data: zones } = await supabase
        .from("zones")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Zonas</h1>
                    <p className="text-muted-foreground">Administra las zonas de mediación</p>
                </div>

                <CreateZoneDialog />
            </div>


            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zones?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No hay zonas creadas aún.
                                </TableCell>
                            </TableRow>
                        ) : (
                            zones?.map((zone) => (
                                <TableRow key={zone.id}>
                                    <TableCell className="font-medium">{zone.name}</TableCell>
                                    <TableCell>{zone.description || "-"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${zone.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}>
                                            {zone.is_active ? "Activa" : "Inactiva"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Placeholder for edit/delete actions */}
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout >
    );
}
