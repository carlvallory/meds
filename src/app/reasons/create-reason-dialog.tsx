"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { createReason } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateReasonDialog() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        const res = await createReason(formData);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Motivo creado");
            setOpen(false);
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Motivo
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Motivo</DialogTitle>
                    <DialogDescription>
                        Ej: "Baño", "Trámite", "Almuerzo"
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="label">Etiqueta</Label>
                            <Input id="label" name="label" required placeholder="Ej: Pausa Activa" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
