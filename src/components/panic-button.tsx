"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { triggerPanic } from "@/app/actions/panic";
import { toast } from "sonner"; // Assuming we might add toast later, or simple alert

export default function PanicButton() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePanic = async () => {
        setLoading(true);
        const res = await triggerPanic();
        if (res?.error) {
            alert("Error: " + res.error);
        } else {
            setSuccess(true);
            // Reset after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        }
        setLoading(false);
    };

    return (
        <div className="w-full mt-8">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        className="w-full h-16 text-xl font-bold uppercase tracking-widest shadow-lg animate-pulse hover:animate-none"
                    >
                        <AlertTriangle className="mr-2 h-6 w-6" />
                        Botón de Pánico
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-red-500 border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 font-bold text-2xl flex items-center gap-2">
                            <AlertTriangle className="h-8 w-8" />
                            ¿Confirmar Emergencia?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-lg">
                            Esto notificará inmediatamente a todos los capitanes y mediadores cercanos.
                            Úsalo solo en caso de emergencia real.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePanic}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "SÍ, ACTIVAR AHORA"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {success && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center font-bold animate-bounce">
                    ALERTA ENVIADA EXITOSAMENTE
                </div>
            )}
        </div>
    );
}
