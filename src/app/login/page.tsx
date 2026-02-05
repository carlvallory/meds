import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
            <Tabs defaultValue="login" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Ingresar</TabsTrigger>
                    <TabsTrigger value="register">Registro</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bienvenido</CardTitle>
                            <CardDescription>
                                Ingresa tus credenciales para acceder al sistema.
                            </CardDescription>
                        </CardHeader>
                        <form action={login}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="usuario@museo.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">Iniciar Sesión</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>Crear Cuenta</CardTitle>
                            <CardDescription>
                                Regístrate nuevos empleados (Solo admin debería ver esto en prod).
                            </CardDescription>
                        </CardHeader>
                        <form action={signup}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nombre Completo</Label>
                                    <Input id="fullName" name="fullName" placeholder="Juan Pérez" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input id="register-email" name="email" type="email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Contraseña</Label>
                                    <Input id="register-password" name="password" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline">Registrarse</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
