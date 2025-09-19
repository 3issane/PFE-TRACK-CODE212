import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import { GoogleIcon } from "@/components/icons/google-icon"

export default function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const googleBtnRef = useRef(null)
  const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8080"
  const [googleClientId, setGoogleClientId] = useState("")

  // Load Google script (same logic as login page)
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

  // Fetch client id from backend on mount if not already set
  useEffect(() => {
    if (googleClientId) return
    fetch(`${API_BASE}/api/auth/google-client-id`).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
      if (d?.clientId) setGoogleClientId(d.clientId)
    }).catch(()=>{})
  }, [googleClientId, API_BASE])

  function initGoogle() {
    // @ts-ignore
  if (!window.google || !googleClientId) return
    // @ts-ignore
    window.google.accounts.id.initialize({
  client_id: googleClientId,
      callback: handleGoogleCredential,
      auto_select: false,
    })
    try {
      const isDark = document.documentElement.classList.contains('dark')
      // @ts-ignore
      window.google.accounts.id.renderButton(
        googleBtnRef.current,
        {
          type: "standard",
          theme: isDark ? "filled_black" : "outline",
          size: "large",
          text: "signup_with",
          shape: "pill",
          logo_alignment: "left",
          width: 250
        }
      )
      setTimeout(() => {
        const container = googleBtnRef.current
        const iframe = container?.querySelector('iframe')
        if (iframe && container) {
          iframe.style.border = 'none'
          iframe.style.outline = 'none'
          iframe.style.boxShadow = 'none'
          
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

  async function handleGoogleCredential(response) {
    try {
      setError(null)
      const idToken = response.credential
      const res = await fetch(`${API_BASE}/api/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) })
      if (!res.ok) throw new Error(await res.text() || "Google échec")
      const data = await res.json()
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("role", data.role)
      if (data.id) localStorage.setItem("userId", String(data.id))
      if (data.name) localStorage.setItem("userName", data.name)
      if (data.role === "STUDENT") navigate("/student/dashboard")
      else if (data.role === "ADMIN") navigate("/admin/dashboard")
      else if (data.role === "PROFESSOR") navigate("/professor/dashboard")
    } catch (e) {
      setError(e.message || "Google login failed")
    }
  }

  // No explicit prompt; official button will open the account chooser

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const firstName = String(formData.get("firstName") || "").trim()
    const lastName = String(formData.get("lastName") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")
    const repeatPassword = String(formData.get("repeatPassword") || "")
    if (password !== repeatPassword) {
      setLoading(false)
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Echec de l'inscription (${res.status})`)
      }
      navigate("/login")
  } catch (err) {
      setError(err?.message || "Echec de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))} className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium">Retour</span>
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Renseignez vos informations pour vous inscrire</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-3">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" name="firstName" required placeholder="Votre prénom" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" required placeholder="Votre nom" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="vous@example.com" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="repeatPassword">Répéter le mot de passe</Label>
              <Input id="repeatPassword" name="repeatPassword" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
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
            <div className="text-center text-sm">
              Déjà inscrit ? {" "}
              <a href="/login" className="underline underline-offset-4">
                Se connecter
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
