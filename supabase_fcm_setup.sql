-- Tabla para guardar Tokens FCM de cada usuario
create table if not exists user_fcm_tokens (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text check (platform in ('web', 'android', 'ios')) default 'web',
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS
alter table user_fcm_tokens enable row level security;

-- Usuario puede insertar/actualizar su propio token
create policy "Users can manage own fcm tokens"
  on user_fcm_tokens for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin/Server (Service Role) tiene acceso total (por defecto si se usa service_role key, 
-- pero para consultas autenticadas del server action usamos security definer si es necesario, 
-- aunque aquí las server actions usan createClient de server que actúa como el usuario o admin).
-- Para enviar notificaciones, usaremos firebase-admin que no pasa por RLS de Supabase directamente 
-- si consultamos la DB con service_role, o con el usuario logueado.
