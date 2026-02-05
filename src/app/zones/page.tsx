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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { createZone } from "./actions";
import DashboardLayout from "../layout-dashboard";
import { Switch } from "@/components/ui/switch"; // Assuming we install switch

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

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Zona
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Zona</DialogTitle>
                            <DialogDescription>
                                Añade una nueva ubicación para asignar mediadores.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={createZone}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" name="name" placeholder="Ej: Entrada Principal" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descripción (Opcional)</Label>
                                    <Input id="description" name="description" placeholder="Ubicada en el hall central" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Guardar Zona</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
        </DashboardLayout>
    );
}
