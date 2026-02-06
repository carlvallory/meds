"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messagingPromise } from "@/lib/firebase/client";
import { saveFcmToken } from "@/app/actions/notifications";
import { toast } from "sonner";

export default function useFcmToken() {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            return;
        }

        const retrieveToken = async () => {
            try {
                const messaging = await messagingPromise;
                if (!messaging) return;

                const permission = await Notification.requestPermission();
                setPermission(permission);

                if (permission === "granted") {
                    const currentToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        // Send to server
                        await saveFcmToken(currentToken);
                        console.log("FCM Token saved:", currentToken);
                    } else {
                        console.log("No registration token available. Request permission to generate one.");
                    }
                }
            } catch (error) {
                console.error("An error occurred while retrieving token:", error);
                // toast.error("Error FCM", { description: "No se pudieron activar las notificaciones." });
            }
        };

        retrieveToken();
    }, []);

    return { token, permission };
}
