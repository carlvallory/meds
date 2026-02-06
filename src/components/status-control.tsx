"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { startBreak, endStatus, startUnavailable } from "@/app/actions/status";
import { Coffee, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

type Reason = { id: string; reason_label: string };

interface StatusControlProps {
    currentStatus: "available" | "break" | "unavailable";
    startTime?: string | null; // ISO string if active
    reasons: Reason[];
}

export default function StatusControl({ currentStatus, startTime, reasons }: StatusControlProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isUnavailableOpen, setIsUnavailableOpen] = useState(false);

    const handleStartBreak = async () => {
        setLoading(true);
        setErrorMsg(null);
        const res = await startBreak();
        if (res?.error) {
            setErrorMsg(res.error);
        } else {
            // Success
        }
        setLoading(false);
        router.refresh();
    };

    const handleEndStatus = async () => {
        setLoading(true);
        const res = await endStatus();
        if (res?.error) setErrorMsg(res.error);
        setLoading(false);
        router.refresh();
    };

    const handleStartUnavailable = async (reasonId: string) => {
        setLoading(true);
        const res = await startUnavailable(reasonId);
        if (res?.error) setErrorMsg(res.error);
        setIsUnavailableOpen(false); // Close dialog
        setLoading(false);
        router.refresh();
    };

    // -- RENDER STATES --

    if (currentStatus === "break") {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center animate-in fade-in">
                <Coffee className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
                <h2 className="text-xl font-bold text-yellow-800 mb-1">En Break</h2>
                <p className="text-yellow-700 text-sm mb-4">
                    Disfruta tu descanso. Recuerda marcar el fin al volver.
                </p>
                {/* Timer could go here */}
                <Button
                    onClick={handleEndStatus}
                    disabled={loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                    {loading ? "Finalizando..." : "Finalizar Break"}
                </Button>
            </div>
        );
    }

    if (currentStatus === "unavailable") {
        return (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center animate-in fade-in">
                <Ban className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                <h2 className="text-xl font-bold text-gray-800 mb-1">No Disponible</h2>
                <p className="text-gray-600 text-sm mb-4">
                    Tu estado está marcado como ocupado.
                </p>
                <Button
                    onClick={handleEndStatus}
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                >
                    {loading ? "Finalizando..." : "Volver a Disponible"}
                </Button>
            </div>
        );
    }

    // DEFAULT: AVAILABLE
    return (
        <div className="space-y-4">
            {errorMsg && (
                <div className="p-3 bg-red-100 text-red-800 text-sm rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {/* Break Button */}
                <Button
                    className="h-32 flex flex-col items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 border-b-4 border-yellow-700 active:border-b-0 active:mt-1"
                    onClick={handleStartBreak}
                    disabled={loading}
                >
                    <Coffee className="w-8 h-8" />
                    <span className="text-lg font-bold">Break</span>
                </Button>

                {/* Unavailable Button (Dialog) */}
                <Dialog open={isUnavailableOpen} onOpenChange={setIsUnavailableOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600"
                            disabled={loading}
                        >
                            <Ban className="w-8 h-8" />
                            <span className="text-lg font-bold">No Disponible</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Selecciona el motivo</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                            {reasons.length === 0 && <p className="text-sm text-center text-muted-foreground">No hay motivos configurados.</p>}
                            {reasons.map(r => (
                                <Button key={r.id} variant="secondary" className="justify-start h-12 text-lg" onClick={() => handleStartUnavailable(r.id)}>
                                    {r.reason_label}
                                </Button>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsUnavailableOpen(false)}>Cancelar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
