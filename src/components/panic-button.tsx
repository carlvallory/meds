"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";
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
import { triggerPanic, resolvePanic, getActivePanic } from "@/app/actions/panic";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PanicButton() {
    const [loading, setLoading] = useState(false);
    const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkStatus();
    }, []);

    async function checkStatus() {
        setChecking(true);
        const active = await getActivePanic();
        if (active?.id) {
            setActiveAlertId(active.id);
        }
        setChecking(false);
    }

    const handlePanic = async () => {
        setLoading(true);
        const res = await triggerPanic();
        if (res?.error) {
            toast.error("Error al enviar alerta", { description: res.error });
        } else {
            setActiveAlertId(res.alertId || "temp-id"); // fallback
            toast.error("¡ALERTA ENVIADA!", {
                description: "Se ha notificado a los capitanes.",
                duration: Infinity,
            });
        }
        setLoading(false);
    };

    const handleCancel = async () => {
        if (!activeAlertId) return;
        setLoading(true);
        const res = await resolvePanic(activeAlertId);
        if (res?.error) {
            toast.error("Error al cancelar", { description: res.error });
        } else {
            setActiveAlertId(null);
            toast.success("Alerta cancelada/resuelta");
        }
        setLoading(false);
    };

    if (checking) {
        return <div className="w-full mt-8 h-16 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    // STATE: ACTIVE PANIC (Show Cancel UI)
    if (activeAlertId) {
        return (
            <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xl mb-2 animate-pulse">
                        <AlertTriangle className="h-6 w-6" />
                        EMERGENCIA ACTIVA
                    </div>
                    <p className="text-red-700 mb-4 text-sm">
                        La ayuda está en camino. Si fue un error o ya estás seguro, puedes cancelar.
                    </p>
                    <Button
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                        YA ESTOY SEGURO (RESOLVER)
                    </Button>
                </div>
            </div>
        );
    }

    // STATE: READY (Show Trigger UI)
    return (
        <div className="w-full mt-8">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        className="w-full h-16 text-xl font-bold uppercase tracking-widest shadow-lg hover:animate-none bg-red-600 hover:bg-red-700"
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
        </div>
    );
}
