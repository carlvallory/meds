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
    // ... (skip unchanged) ...
    {
        reasons.map(r => (
            <Button key={r.id} variant="secondary" className="justify-start h-12 text-lg" onClick={() => handleStartUnavailable(r.id)}>
                {r.reason_label}
            </Button>
        ))
    }
                        </div >
        <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUnavailableOpen(false)}>Cancelar</Button>
        </DialogFooter>
                    </DialogContent >
                </Dialog >
            </div >
        </div >
    );
}
