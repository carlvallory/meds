import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    const userRole = userData?.role || 'mediator';
    const userName = userData?.full_name || user.email?.split('@')[0];

    const signOut = async () => {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    };

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl">
                    <span className="text-blue-600">Mediator</span>App
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end text-sm">
                        <span className="font-medium text-gray-900">{userName}</span>
                        <span className="text-xs text-gray-500 capitalize">{userRole}</span>
                    </div>
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                        <AvatarFallback>{userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <form action={signOut}>
                        <Button variant="ghost" size="icon" title="Cerrar Sesión">
                            <LogOut className="h-5 w-5 text-gray-500 hover:text-red-600" />
                        </Button>
                    </form>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
                {children}
            </main>

            {/* Mobile Tab Bar - Only for Mediators usually, but simple for now */}
            <nav className="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden flex justify-around p-3 z-20">
                <Link href="/" className="flex flex-col items-center text-xs text-blue-600">
                    <span className="font-bold">Inicio</span>
                </Link>
                {userRole === 'captain' || userRole === 'admin' ? (
                    <Link href="/zones" className="flex flex-col items-center text-xs text-gray-500">
                        <span>Zonas</span>
                    </Link>
                ) : null}
            </nav>
        </div>
    );
}
