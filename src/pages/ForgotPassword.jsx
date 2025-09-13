import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { toast } from 'sonner'

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8080'

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 email, 2 code, 3 reset, 4 done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // retained for internal checks, not displayed
  const [info, setInfo] = useState('');

  async function requestCode(e) {
    e.preventDefault(); setError(''); setInfo(''); setLoading(true);
    try {
      // Check email existence (students only) before sending code
      const check = await fetch(`${API_BASE}/api/auth/email-exists?email=${encodeURIComponent(email)}`)
      if (check.ok) {
        const data = await check.json()
        if (!data.exists) {
          toast.error('Email inexistant');
          setLoading(false);
          return;
        }
      }
      await fetch(`${API_BASE}/api/auth/forgot-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
      setStep(2); setInfo('Si le compte existe un code a été envoyé.');
      toast.success('Code envoyé');
    } catch { toast.error('Echec envoi'); } finally { setLoading(false); }
  }
  async function verifyCode(e) {
    e.preventDefault(); setError(''); setInfo('');
    if (code.length !== 6) { setError('Code must be 6 digits'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, code }) });
      if(!res.ok) { throw new Error(); }
      setStep(3); toast.success('Code vérifié');
    } catch {
      toast.error('Code invalide');
    } finally { setLoading(false); }
  }
  async function resetPwd(e) {
    e.preventDefault(); setError(''); setInfo(''); setLoading(true);
    if (newPassword !== repeatPassword) { setLoading(false); toast.error('Mots de passe différents'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, code, newPassword }) });
      if(!res.ok) throw new Error();
      setStep(4); toast.success('Mot de passe réinitialisé');
    } catch { toast.error('Echec réinitialisation'); } finally { setLoading(false); }
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>Récupérez l'accès à votre compte en quelques étapes</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Inline alerts removed; using sonner toasts only */}
          {step === 1 && (
            <form onSubmit={requestCode} className='space-y-5' noValidate>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='vous@example.com' />
              </div>
              <Button type='submit' className='w-full' disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le code'}</Button>
              <div className='text-center text-xs'>
                <a href='/login' className='underline underline-offset-4'>Retour connexion</a>
              </div>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={verifyCode} className='space-y-5' noValidate>
              <p className='text-xs text-muted-foreground'>Saisissez le code 6 chiffres envoyé (valide 10 min).</p>
              <div className='grid gap-2'>
                <Label>Code</Label>
                <InputOTP maxLength={6} value={code} onChange={(v)=> setCode(v.replace(/[^0-9]/g,'').slice(0,6))} containerClassName='justify-center'>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSeparator className='mx-1 opacity-60' />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type='submit' className='w-full' disabled={loading || code.length!==6}>{loading ? 'Vérification...' : 'Vérifier le code'}</Button>
              <Button type='button' variant='outline' className='w-full' disabled={loading} onClick={()=>{setStep(1); setCode('');}}>Renvoyer</Button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={resetPwd} className='space-y-5' noValidate>
              <div className='grid gap-2'>
                <Label htmlFor='newPassword'>Nouveau mot de passe</Label>
                <Input id='newPassword' type='password' minLength={6} required value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='repeatPassword'>Répéter le mot de passe</Label>
                <Input id='repeatPassword' type='password' minLength={6} required value={repeatPassword} onChange={e=>setRepeatPassword(e.target.value)} />
              </div>
              <Button type='submit' className='w-full' disabled={loading}>{loading ? 'Réinitialisation...' : 'Réinitialiser'}</Button>
            </form>
          )}
          {step === 4 && (
            <div className='space-y-5 text-center'>
              <p className='text-sm text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-300 dark:border-green-400/30 border border-green-200 px-3 py-2 rounded'>Mot de passe réinitialisé. Vous pouvez vous connecter.</p>
              <a className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition' href='/login'>Aller à la connexion</a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
