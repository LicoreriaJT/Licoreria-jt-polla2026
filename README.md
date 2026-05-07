# 🤠 LICORERÍA JT · POLLA MUNDIALERA · Mundial 2026

App profesional de polla futbolera estilo "Wild West" para Licorería JT. Sistema completo: registro de jugadores, pronósticos, ranking en tiempo real y panel de admin.

---

## 🚀 GUÍA DE INSTALACIÓN

> **Tiempo estimado:** 1-2 horas. **Costo total: $0.**

### ¿Qué necesitas?

- ✅ Una cuenta de **Google/Gmail**
- ✅ Una cuenta de **GitHub** (gratis)
- ✅ El logo de Licorería JT (incluido en `public/logo.jpeg`)

---

### PASO 1: Crear cuenta en Supabase

1. Entra a **[supabase.com](https://supabase.com)**
2. Click en **"Start your project"** y registrate con tu Gmail
3. Click en **"New Project"**
4. Configuración:
   - **Name:** `licoreria-jt-polla`
   - **Database Password:** anota una contraseña segura
   - **Region:** `South America (São Paulo)`
   - **Plan:** Free
5. Espera 2-3 minutos
6. Anota: **Project URL** y **anon public key** (Settings → API)

### PASO 2: Cargar el esquema

1. SQL Editor → New Query
2. Copia todo el contenido de `supabase/schema.sql` y pégalo
3. Click "Run"

### PASO 3: Subir a GitHub

Usa **GitHub Desktop** (la app gratis):
1. Crea cuenta en github.com
2. Descarga github.com/desktop
3. File → New repository → `licoreria-jt-polla`
4. Copia los archivos del proyecto al repositorio
5. Commit + Publish repository

### PASO 4: Desplegar en Vercel

1. Entra a **vercel.com** con tu cuenta de GitHub
2. Importa el repositorio `licoreria-jt-polla`
3. Agrega variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL` → tu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → tu anon key
   - `NEXT_PUBLIC_APP_URL` → `https://licoreria-jt-polla.vercel.app`
4. Click "Deploy"

### PASO 5: Crear primer admin

1. En Supabase → Table Editor → `validation_codes`
2. Insert row con `code: LJT-ADMIN1`
3. Ve a tu URL de Vercel → Registrarme con código `LJT-ADMIN1`
4. En Supabase → SQL Editor:
   ```sql
   UPDATE profiles SET is_admin = TRUE WHERE cedula = 'TU_CEDULA';
   ```
5. Cierra sesión y vuelve a entrar → ¡Aparece el panel Admin!

### PASO 6: Desactivar confirmación email

En Supabase → Authentication → Providers → Email → desactiva "Confirm email"

---

## 📱 USO DIARIO

### Para el cajero/admin:
1. Cliente acumula $50.000 → Admin entra a `/admin/codes` → "Generar código"
2. Le da el código al cliente (ej: `LJT-X8KL2P`)
3. El cliente lo usa para registrarse

### Para gestionar partidos:
1. Ir a `/admin/matches` → "Nuevo partido"
2. Cuando termine el partido, ingresa el marcador
3. Los puntos se calculan **automáticamente**

---

## 🛠️ Stack Tecnológico

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth)
- **TailwindCSS** (Diseño Western/Wild West)
- **Vercel** (Deploy gratuito)

**Costo: $0/mes** (todo en free tier)

---

Made with 🤠 + ⚽ for **Licorería JT**.
