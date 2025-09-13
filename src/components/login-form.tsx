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
import { useEffect, useState } from "react"
import { Mail } from "lucide-react"
import { GoogleIcon } from "@/components/icons/google-icon"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleReady, setGoogleReady] = useState(false)

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
    // Disable FedCM prompt path for now to avoid CORS / experimental issues during local dev
    use_fedcm_for_prompt: false,
    })
    setGoogleReady(true)
  }

  async function handleGoogleCredential(response: any) {
    try {
      setError(null)
      const idToken = response.credential
      const res = await fetch(`${API_BASE}/api/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) })
      if (!res.ok) throw new Error(await res.text() || "Google login failed")
      const data = await res.json()
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("role", data.role)
      if (data.id) localStorage.setItem("userId", String(data.id))
      if (data.name) localStorage.setItem("userName", data.name)
      if (data.role === "STUDENT") navigate("/student/dashboard")
      else if (data.role === "ADMIN") navigate("/admin/dashboard")
      else if (data.role === "PROFESSOR") navigate("/professor/dashboard")
    } catch (e: any) {
      setError(e.message || "Google login failed")
    }
  }

  function startGoogleLogin() {
    setError(null)
    // @ts-ignore
    if (window.google?.accounts?.id) {
      try {
        // @ts-ignore
        window.google.accounts.id.prompt()
      } catch (e) {
        setError("Google prompt failed")
      }
    } else {
      setError("Google not ready")
    }
  }

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
        throw new Error(msg || `Login failed (${res.status})`)
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
      setError(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={!googleClientId || !googleReady}
                  onClick={startGoogleLogin}
                >
                  <GoogleIcon className="h-4 w-4" />
                  {!googleClientId ? "Chargement..." : (googleReady ? "Continuer avec Google" : "Initialisation...")}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
