import { cookies } from "next/headers"
import type { Role } from "./types"

const COOKIE_NAME = "dit_role"

// Las contraseñas viven solo en variables de entorno. Sin ellas la app no
// arranca: un error visible al desplegar es preferible a una contraseña
// conocida funcionando en producción.
function contraseñaRequerida(nombre: "ADMIN_PASSWORD" | "VIEWER_PASSWORD"): string {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`${nombre} no está configurada`)
  return valor
}

const ADMIN_PASSWORD = contraseñaRequerida("ADMIN_PASSWORD")
const VIEWER_PASSWORD = contraseñaRequerida("VIEWER_PASSWORD")

export function checkPassword(password: string): Role | null {
  if (password === ADMIN_PASSWORD) return "admin"
  if (password === VIEWER_PASSWORD) return "visitante"
  return null
}

export async function getRole(): Promise<Role | null> {
  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value
  if (value === "admin" || value === "visitante") return value
  return null
}

export async function setRole(role: Role) {
  const store = await cookies()
  store.set(COOKIE_NAME, role, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearRole() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
