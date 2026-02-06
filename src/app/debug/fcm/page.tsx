import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export default async function DebugFCM() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8">Not logged in</div>;
    }

    // Get user info
    const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    // Check if service role key is configured
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Initialize Admin Client if key exists
    let allUsers: any[] = [];
    let allTokens: any[] = [];
    if (hasServiceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: usersData } = await supabaseAdmin.from("users").select("id, full_name, role");
        const { data: tokensData } = await supabaseAdmin.from("user_fcm_tokens").select("*");

        allUsers = usersData || [];
        allTokens = tokensData || [];
    }

    // Check Firebase Admin config
    const hasFirebaseAdminConfig = !!(
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    );

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">🔍 FCM Debug Dashboard</h1>

            <div className="space-y-6">
                {/* Current User */}
                <div className="border p-4 rounded">
                    <h2 className="font-bold mb-2">Tu Usuario</h2>
                    <p>Email: {user.email}</p>
                    <p>Rol: {userData?.role || "N/A"}</p>
                    <p>ID: {user.id}</p>
                </div>

                {/* Environment Check */}
                <div className="border p-4 rounded">
                    <h2 className="font-bold mb-2">Configuración del Servidor</h2>
                    <p>✅ SUPABASE_SERVICE_ROLE_KEY: {hasServiceRoleKey ? "Configurada" : "❌ FALTA"}</p>
                    <p>✅ Firebase Admin SDK: {hasFirebaseAdminConfig ? "Configurada" : "❌ FALTA"}</p>
                </div>

                {/* All Users */}
                {hasServiceRoleKey && (
                    <div className="border p-4 rounded">
                        <h2 className="font-bold mb-2">Usuarios Registrados ({allUsers.length})</h2>
                        <ul className="space-y-1 text-sm">
                            {allUsers.map((u: any) => (
                                <li key={u.id}>
                                    {u.full_name || "Sin nombre"} - <span className="font-semibold">{u.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* All Tokens */}
                {hasServiceRoleKey && (
                    <div className="border p-4 rounded">
                        <h2 className="font-bold mb-2">Tokens FCM Guardados ({allTokens.length})</h2>
                        {allTokens.length === 0 ? (
                            <p className="text-red-600">❌ No hay tokens guardados. Los usuarios deben entrar al dashboard y aceptar permisos.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {allTokens.map((t: any) => {
                                    const userForToken = allUsers.find((u: any) => u.id === t.user_id);
                                    return (
                                        <li key={t.token} className="border-l-4 border-blue-500 pl-2">
                                            <p className="font-semibold">{userForToken?.full_name || "Usuario desconocido"} ({userForToken?.role})</p>
                                            <p className="text-xs text-gray-500">Token: {t.token.substring(0, 30)}...</p>
                                            <p className="text-xs">Platform: {t.platform} | Updated: {new Date(t.last_updated).toLocaleString()}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <h2 className="font-bold mb-2">📋 Cómo Interpretar</h2>
                    <ul className="text-sm space-y-1">
                        <li>1. Verifica que tu usuario Admin tenga un token guardado en la lista.</li>
                        <li>2. Si no tienes token, recarga la página principal y acepta los permisos de notificación.</li>
                        <li>3. Si faltan las credenciales del servidor, las notificaciones NO funcionarán.</li>
                        <li>4. Una vez que todo esté verde, prueba el botón de pánico desde otro navegador/usuario.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
