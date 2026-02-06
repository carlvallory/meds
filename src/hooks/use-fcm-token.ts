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
                    // Register SW with query params to pass config without hardcoding secrets in public file
                    if ("serviceWorker" in navigator) {
                        const firebaseConfigUrl = new URLSearchParams({
                            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
                            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
                            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
                            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
                            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
                            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
                        }).toString();

                        await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${firebaseConfigUrl}`);
                    }

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
