import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "../layout-dashboard";
import { CreateReasonDialog } from "./create-reason-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ReasonsPage() {
    const supabase = await createClient();
    const { data: reasons } = await supabase
        .from("availability_reasons")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Motivos</h1>
                    <p className="text-muted-foreground">Opciones para el estado 'No Disponible'</p>
                </div>
                <CreateReasonDialog />
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reasons?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                    No hay motivos configurados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reasons?.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.reason_label}</TableCell>
                                    <TableCell>
                                        <Badge variant={r.is_active ? "default" : "secondary"}>
                                            {r.is_active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout>
    );
}
