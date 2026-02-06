"use client";

import useFcmToken from "@/hooks/use-fcm-token";

export default function FcmManager() {
    useFcmToken();
    return null; // Invisible component just for logic
}
