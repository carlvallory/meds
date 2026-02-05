"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UserProfile, StatusLog, Zone } from "@/types/database";

type MediatorWithStatus = UserProfile & {
    zones: { name: string } | null;
    active_log: StatusLog | null; // We will attach this manually
};

interface DashboardProps {
    initialMediators: MediatorWithStatus[];
}

export default function LiveDashboardTable({ initialMediators }: DashboardProps) {
    const [mediators, setMediators] = useState<MediatorWithStatus[]>(initialMediators);
    const supabase = createClient();

    useEffect(() => {
        // 1. Subscribe to Status Changes (INSERT/UPDATE on status_logs)
        const statusChannel = supabase
            .channel("realtime-status")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "status_logs" },
                (payload) => {
                    console.log("Status Change:", payload);
                    // Refresh data logic: Since joining tables in realtime is hard, 
                    // we re-fetch the single user's status or refresh the whole list.
                    // For simplicity/accuracy in MVP, let's trigger a router refresh or fetch specifically?
                    // Actually, let's just update local state if possible.

                    const newLog = payload.new as StatusLog;

                    setMediators((prev) =>
                        prev.map((m) => {
                            if (m.id === newLog?.user_id) {
                                // If it's a new log (start break), attach it.
                                // If update (end break), if end_time is set, clear active_log
                                if (payload.eventType === 'INSERT') {
                                    return { ...m, active_log: newLog };
                                }
                                if (payload.eventType === 'UPDATE' && newLog.end_time) {
                                    return { ...m, active_log: null };
                                }
                            }
                            return m;
                        })
                    );
                }
            )
            .subscribe();

        // 2. Subscribe to Panic Alerts (INSERT on panic_alerts)
        const panicChannel = supabase
            .channel("realtime-panic")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "panic_alerts" },
                (payload) => {
                    console.log("PANIC ALERT:", payload);
                    // Play sound?
                    // Show persistent toast
                    import("sonner").then(({ toast }) => {
                        toast.error("🚨 ALERTA DE PÁNICO 🚨", {
                            description: "Un mediador ha activado el botón de emergencia. Revisa la zona inmediatamente.",
                            duration: Infinity, // Sticky
                            action: {
                                label: "Entendido",
                                onClick: () => console.log("Alert Acknowledged")
                            },
                            className: "bg-red-600 border-red-800 text-white"
                        });
                    });
                }
            )
            .subscribe();

        // 2. Subscribe to Users (Active/Inactive, Zone changes)
        // Removed for MVP simplicity, assume users static for now.

        return () => {
            supabase.removeChannel(statusChannel);
            supabase.removeChannel(panicChannel);
        };
    }, [supabase]);

    // Force re-render every minute to update "time ago"? 
    // Custom hook usage would be better, but simple interval works.
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mediador</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Tiempo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mediators.map((mediator) => {
                        const status = mediator.active_log ? mediator.active_log.type : 'available';
                        const variant = status === 'break' ? 'destructive' : (status === 'unavailable' ? 'secondary' : 'default'); // active-green default? badge variants differ.
                        // Let's use custom classes for variants actually

                        let statusLabel = "Disponible";
                        let statusColor = "bg-green-100 text-green-800 hover:bg-green-100";
                        if (status === 'break') {
                            statusLabel = "En Break";
                            statusColor = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
                        } else if (status === 'unavailable') {
                            statusLabel = "No Disponible";
                            statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100";
                        }

                        return (
                            <TableRow key={mediator.id}>
                                <TableCell className="font-medium">{mediator.full_name || mediator.email}</TableCell>
                                <TableCell>{mediator.zones?.name || "Sin Zona"}</TableCell>
                                <TableCell>
                                    <Badge className={statusColor} variant="outline">
                                        {statusLabel}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {mediator.active_log ? (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {formatDistanceToNow(new Date(mediator.active_log.start_time), { addSuffix: false, locale: es })}
                                        </span>
                                    ) : "-"}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
