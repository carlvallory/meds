import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { adminMessaging } from "@/lib/firebase/server";

export async function GET() {
    try {
        // Check Firebase Admin
        if (!adminMessaging) {
            return NextResponse.json({
                error: "Firebase Admin Messaging not initialized",
                details: "Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
            }, { status: 500 });
        }

        // Check Supabase Service Role
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({
                error: "Missing Supabase credentials"
            }, { status: 500 });
        }

        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Get all admin users
        const { data: adminUsers, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, full_name")
            .eq("role", "admin");

        if (userError || !adminUsers?.length) {
            return NextResponse.json({
                error: "No admin users found",
                details: userError?.message
            }, { status: 404 });
        }

        // Get tokens for admin users
        const adminUserIds = adminUsers.map(u => u.id);
        const { data: tokensData, error: tokenError } = await supabaseAdmin
            .from("user_fcm_tokens")
            .select("token, user_id")
            .in("user_id", adminUserIds);

        if (tokenError || !tokensData?.length) {
            return NextResponse.json({
                error: "No FCM tokens found for admin users",
                details: tokenError?.message,
                adminUsers: adminUsers.map(u => u.full_name)
            }, { status: 404 });
        }

        const tokens = tokensData.map(t => t.token);

        // Try to send test notification
        const message = {
            notification: {
                title: "🧪 TEST - Notificación de Prueba",
                body: "Si ves esto, ¡las notificaciones funcionan!"
            },
            data: {
                test: "true",
                timestamp: new Date().toISOString()
            },
            tokens: tokens
        };

        const response = await adminMessaging.sendEachForMulticast(message);

        // Build detailed response
        const results = response.responses.map((resp, idx) => ({
            token: tokens[idx].substring(0, 20) + "...",
            success: resp.success,
            error: resp.error ? {
                code: resp.error.code,
                message: resp.error.message
            } : null
        }));

        return NextResponse.json({
            success: true,
            summary: {
                total: tokens.length,
                successful: response.successCount,
                failed: response.failureCount
            },
            results,
            adminUsers: adminUsers.map(u => u.full_name)
        });

    } catch (error: any) {
        console.error("Test notification error:", error);
        return NextResponse.json({
            error: "Failed to send test notification",
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
