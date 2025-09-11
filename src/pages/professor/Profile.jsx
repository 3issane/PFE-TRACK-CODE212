import React, { useEffect, useState } from 'react';
import { authHeader, clearAuth, getRole } from '@/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  IconMail,
  IconShieldLock,
  IconLogout,
  IconEdit,
  IconCopy,
  IconCheck,
  IconClock,
  IconIdBadge,
  IconLock,
  IconUserCircle,
  IconSettings,
  IconUser,
  IconDashboard
} from '@tabler/icons-react';

export default function Profile() {
  const navigate = useNavigate();
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8080';

  const [profile, setProfile] = useState({ name: '', email: '', role: getRole() });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [pwdDraft, setPwdDraft] = useState({ current:'', next:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { 'Content-Type':'application/json', ...authHeader() }});
        if (res.status === 401) {
          clearAuth();
            navigate('/login', { replace: true });
            return;
        }
        if (!cancelled && res.ok) {
          const data = await res.json();
          const role = data.role || getRole();
          setProfile({ name: data.name || '', email: data.email || '', role });
          setNameDraft(data.name || '');
        } else if (!cancelled && !res.ok) {
          setError('Failed to load profile');
        }
      } catch (e) {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(()=>setCopied(false),1500); } catch {}
  }

  const initials = profile.name ? profile.name.split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase() : (profile.email?.[0] || 'U').toUpperCase();

  async function submitProfile(e){
    e.preventDefault();
    setSaveMsg('');
    // Placeholder: backend endpoint for updating name/password not yet implemented.
    // Provide optimistic local update; instruct user to implement /api/auth/profile (PUT)
    if (pwdDraft.next || pwdDraft.confirm || pwdDraft.current) {
      if (pwdDraft.next !== pwdDraft.confirm) {
        setSaveMsg('Passwords do not match');
        return;
      }
    }
    setSaving(true);
    try {
      // Attempt call if future endpoint exists
  const body = { name: nameDraft || undefined, currentPassword: pwdDraft.current || undefined, newPassword: pwdDraft.next || undefined };
      const res = await fetch(`${API_BASE}/api/auth/profile`, { method:'PUT', headers:{ 'Content-Type':'application/json', ...authHeader() }, body: JSON.stringify(body) });
      if (res.ok) {
        setProfile(p=>({...p, name: nameDraft }));
        setPwdDraft({ current:'', next:'', confirm:'' });
        setEditMode(false);
        setSaveMsg('Updated successfully');
      } else {
        if (res.status === 404) {
          setProfile(p=>({...p, name: nameDraft })); // optimistic name update even if endpoint missing
          setSaveMsg('Local update only (backend endpoint not implemented yet)');
        } else {
          setSaveMsg('Update failed');
        }
      }
    } catch {
      setSaveMsg('Network error');
    } finally { setSaving(false); }
  }

  // placeholder style data (no extra logic changes)
  // removed recent activity & account metrics per request

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col gap-6 p-4 pt-0 w-full max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your personal information and account security</p>
            </div>
            <div className="flex gap-2">
              {!editMode && <Button variant="outline" size="sm" onClick={()=>{ setEditMode(true); setNameDraft(profile.name); }}><IconEdit className="size-4 mr-1"/>Edit</Button>}
              <Button variant="destructive" size="sm" onClick={handleLogout}><IconLogout className="size-4 mr-1"/>Logout</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info Card */}
              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 rounded-xl ring-2 ring-primary/20">
                        <AvatarImage src="" alt={profile.name} />
                        <AvatarFallback className="rounded-xl text-xl bg-gradient-to-br from-primary/70 to-primary">{initials}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-2xl font-semibold">{loading ? 'Loading…' : (profile.name || 'Unnamed User')}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="flex items-center gap-1"><IconShieldLock className="size-3" />{profile.role}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1"><IconUser className="size-3" />Active</Badge>
                      </div>
                    </div>
                  </div>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                </CardHeader>
                <Separator />
                <CardContent className="py-6 space-y-8">
                  {/* Email */}
                  <div className="grid gap-1">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Email</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm break-all">{loading ? <span className="animate-pulse text-muted-foreground">……</span> : (profile.email || '—')}</span>
                      {!loading && profile.email && (
                        <Button size="xs" variant="secondary" type="button" onClick={copyEmail} className="h-6 px-2">
                          {copied ? <IconCheck className="size-3"/> : <IconCopy className="size-3"/>}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Name / Edit */}
                  {!editMode && (
                    <div className="grid gap-1">
                      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Name</span>
                      <span className="text-sm font-medium">{loading ? <span className="animate-pulse text-muted-foreground">……</span> : (profile.name || '—')}</span>
                    </div>
                  )}
                  {editMode && (
                    <form onSubmit={submitProfile} className="grid gap-6">
                      <div className="grid gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Display Name</label>
                        <Input value={nameDraft} onChange={e=>setNameDraft(e.target.value)} placeholder="Your name" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase flex items-center gap-1"><IconLock className="size-3"/> Change Password (optional)</label>
                        <Input type="password" value={pwdDraft.current} onChange={e=>setPwdDraft(p=>({...p,current:e.target.value}))} placeholder="Current password" />
                        <Input type="password" value={pwdDraft.next} onChange={e=>setPwdDraft(p=>({...p,next:e.target.value}))} placeholder="New password" />
                        <Input type="password" value={pwdDraft.confirm} onChange={e=>setPwdDraft(p=>({...p,confirm:e.target.value}))} placeholder="Confirm new password" />
                        <p className="text-xs text-muted-foreground">If backend endpoint /api/auth/profile isn't ready, only name updates locally.</p>
                      </div>
                      {saveMsg && <div className={`text-xs ${saveMsg.includes('success') ? 'text-green-600':'text-muted-foreground'}`}>{saveMsg}</div>}
                      <div className="flex gap-2">
                        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                        <Button type="button" variant="outline" onClick={()=>{ setEditMode(false); setPwdDraft({current:'',next:'',confirm:''}); setSaveMsg(''); }}>Cancel</Button>
                      </div>
                    </form>
                  )}

                  {/* Role */}
                  <div className="grid gap-1">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Role</span>
                    <span className="text-sm font-medium">{loading ? <span className="animate-pulse text-muted-foreground">……</span> : (profile.role || '—')}</span>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted-foreground">
                  <span>Secure area • JWT session</span>
                  <div className="flex gap-2">
                    {!editMode && <Button variant="outline" size="xs" type="button" onClick={()=>navigate(-1)}>Back</Button>}
                    {editMode && <Button variant="ghost" size="xs" type="button" onClick={()=>{ setEditMode(false); setPwdDraft({current:'',next:'',confirm:''}); }}>Close Edit</Button>}
                  </div>
                </CardFooter>
              </Card>

              {/* Recent Activity section removed */}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                  <CardDescription>Shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={()=>setEditMode(true)} disabled={editMode}>
                    <IconEdit className="size-4 mr-2"/>Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={copyEmail} disabled={copied || !profile.email}>
                    {copied ? <IconCheck className="size-4 mr-2"/> : <IconCopy className="size-4 mr-2"/>}
                    {copied ? 'Copied' : 'Copy Email'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={()=>navigate(-1)}>
                    <IconUserCircle className="size-4 mr-2"/>Back
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" size="sm" onClick={handleLogout}>
                    <IconLogout className="size-4 mr-2"/>Logout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
