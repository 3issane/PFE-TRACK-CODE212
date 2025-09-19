import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement | null>(null)

  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8080"
  const [googleClientId, setGoogleClientId] = useState<string>((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "")

  // Fallback: fetch from backend if not provided via env
  useEffect(() => {
    if (googleClientId) return
    fetch(`${API_BASE}/api/auth/google-client-id`).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
      if (d?.clientId) setGoogleClientId(d.clientId)
    }).catch(()=>{})
  }, [googleClientId, API_BASE])

  // Load Google script
  useEffect(() => {
  if (!googleClientId) return
    const id = "google-identity-services"
    if (!document.getElementById(id)) {
      const s = document.createElement("script")
      s.id = id
      s.src = "https://accounts.google.com/gsi/client"
      s.async = true
      s.defer = true
      document.head.appendChild(s)
      s.onload = initGoogle
    } else {
      initGoogle()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId])

  function initGoogle() {
    // @ts-ignore
  if (!window.google || !googleClientId) return
    // @ts-ignore
    window.google.accounts.id.initialize({
  client_id: googleClientId,
      callback: handleGoogleCredential,
    auto_select: false,
    })
    // Render the official Google button
    try {
      const isDark = document.documentElement.classList.contains('dark')
      // @ts-ignore
      window.google.accounts.id.renderButton(
        googleBtnRef.current,
        {
          type: "standard",
          theme: isDark ? "filled_black" : "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 250
        }
      )
      // Adjust styling for dark mode compatibility
      setTimeout(() => {
        const container = googleBtnRef.current
        const iframe = container?.querySelector('iframe') as HTMLIFrameElement | null
        if (iframe && container) {
          iframe.style.border = 'none'
          iframe.style.outline = 'none'
          ;(iframe.style as any).boxShadow = 'none'
          
          // Fix for dark mode
          if (isDark) {
            iframe.style.backgroundColor = 'transparent'
            container.style.backgroundColor = 'transparent'
          }
        }
      }, 50)
    } catch (_) {}
    setGoogleReady(true)
  }

  async function handleGoogleCredential(response: any) {
    try {
      setError(null)
      const idToken = response.credential
      const res = await fetch(`${API_BASE}/api/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) })
  if (!res.ok) throw new Error(await res.text() || "Échec de connexion Google")
      const data = await res.json()
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("role", data.role)
      if (data.id) localStorage.setItem("userId", String(data.id))
      if (data.name) localStorage.setItem("userName", data.name)
      if (data.role === "STUDENT") navigate("/student/dashboard")
      else if (data.role === "ADMIN") navigate("/admin/dashboard")
      else if (data.role === "PROFESSOR") navigate("/professor/dashboard")
    } catch (e: any) {
      setError(e.message || "Échec de connexion Google")
    }
  }

  // No explicit prompt; the official button handles showing the chooser

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const msg = await res.text()
  throw new Error(msg || `Échec de connexion (${res.status})`)
      }
      const data = (await res.json()) as { token: string; role: "STUDENT" | "ADMIN" | "PROFESSOR"; id?: number; name?: string }
      // store token (simple localStorage; replace with a more secure store if needed)
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("role", data.role)
      if (data.id) localStorage.setItem("userId", String(data.id))
      if (data.name) localStorage.setItem("userName", data.name)
      // redirect by role
  if (data.role === "STUDENT") navigate("/student/dashboard")
  else if (data.role === "ADMIN") navigate("/admin/dashboard")
  else if (data.role === "PROFESSOR") navigate("/professor/dashboard")
    } catch (err: any) {
  setError(err?.message || "Échec de connexion")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Connectez-vous à votre compte</CardTitle>
          <CardDescription>Entrez votre email ci-dessous pour vous connecter</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="moi@exemple.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
                <div className="flex justify-center mt-2">
                  <div
                    ref={googleBtnRef}
                    className="inline-flex google-button-container"
                    style={{ 
                      lineHeight: 0, 
                      background: 'transparent',
                      padding: 0,
                      margin: 0,
                      overflow: 'hidden',
                      borderRadius: '20px'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous n&apos;avez pas de compte ?{" "}
              <a href="/register" className="underline underline-offset-4">
                Créer un compte
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
