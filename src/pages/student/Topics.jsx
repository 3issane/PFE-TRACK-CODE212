import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconBook2, IconSearch, IconFilter, IconCalendar, IconUser, IconCheck } from "@tabler/icons-react";
import { authHeader, clearAuth, getRole, getDashboardPath } from "@/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080";

// StudentTopics: read-only list of topics relevant to the student (applied/assigned or all)
export default function StudentTopics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all"); // 'all' or 'mine' (applied)
  const [selected, setSelected] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false); // details dialog
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const [myTopicId, setMyTopicId] = useState(null);
  const [applying, setApplying] = useState(false);
  // removed expandedId (using dialog instead)

  useEffect(() => {
    fetchMyTopic();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [scopeFilter, myTopicId]);
  async function fetchMyTopic() {
    try {
      const res = await fetch(`${API_BASE}/api/topics/my-topic`, { headers: { ...authHeader() } });
      if (res.status === 401) { clearAuth(); navigate('/login'); return; }
      if (res.status === 403) { navigate(getDashboardPath()); return; }
      if (res.ok) {
        const data = await res.json();
        if (data && data.topicId) setMyTopicId(data.topicId); else setMyTopicId(null);
      }
    } catch (e) { console.error(e); }
  }

  async function applyToTopic(topic) {
    if (myTopicId) return; // already have one
    setApplying(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ topicId: topic.id })
      });
      if (res.status === 401) { clearAuth(); navigate('/login'); return; }
      if (res.status === 409) {
        // already has a topic
        await fetchMyTopic();
      }
      if (!res.ok && res.status !== 409) {
        console.error('Apply failed');
      } else {
        await fetchMyTopic();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(false);
      setApplyConfirmOpen(false);
    }
  }

  async function fetchTopics() {
    try {
      setLoading(true);
      if (scopeFilter === 'mine') {
        const res = await fetch(`${API_BASE}/api/topics/my-topic`, { headers: { ...authHeader() } });
        if (res.status === 401) { clearAuth(); navigate('/login', {replace:true}); return; }
        if (res.status === 403) { navigate(getDashboardPath(), {replace:true}); return; }
        if (!res.ok) throw new Error('Failed to load my topic');
        const data = await res.json();
        if (data && data.topicId) {
          // Map to topic object shape expected by UI
          setTopics([{ id: data.topicId, title: data.title, description: data.description, creatorName: data.professorName, creatorEmail: data.professorEmail, department: null, createdAt: data.assignedAt }]);
        } else {
          setTopics([]);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/topics`, { headers: { ...authHeader() } });
        if (res.status === 401) { clearAuth(); navigate('/login', {replace:true}); return; }
        if (res.status === 403) { navigate(getDashboardPath(), {replace:true}); return; }
        if (!res.ok) throw new Error('Failed to load topics');
        const data = await res.json();
        setTopics(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return topics.filter(t =>
      !term || (t.title || "").toLowerCase().includes(term) || (t.description || "").toLowerCase().includes(term)
    );
  }, [topics, searchTerm]);

  function openView(t) {
    setSelected(t);
    setIsViewOpen(true);
  }

  function openApply(t) {
    setSelected(t);
    setApplyConfirmOpen(true);
  }

  // export disabled for student (keep simple)

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Topics</h1>
              <p className="text-muted-foreground mt-1">Browse topics you are involved in.</p>
            </div>
            <div className="flex items-center gap-2" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input className="pl-9" placeholder="Search topics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
      <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-44">
                <IconFilter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="mine">My Applied Topic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topics grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(t => (
              <Card key={t.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg mb-2 break-words">{t.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">Topic</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="mb-3 line-clamp-3">{t.description || 'No description'}</CardDescription>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center"><IconUser className="size-4 mr-2" /> {t.creatorName || ''}</div>
                    <div className="flex items-center"><IconCalendar className="size-4 mr-2" /> {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</div>
                    <div className="flex items-center"><IconBook2 className="size-4 mr-2" /> {(t.department || '').toString().replaceAll('_',' ') || '-'}</div>
                  </div>
                  <div className="mt-auto flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" onClick={()=>openView(t)}>Details</Button>
                    {(!myTopicId || myTopicId === t.id) && (
                      <Button size="sm" disabled={!!myTopicId && myTopicId !== t.id} onClick={()=>openApply(t)} variant={myTopicId===t.id?"secondary":"default"}>
                        {myTopicId===t.id ? <><IconCheck className="size-4 mr-1"/> Applied</> : 'Apply'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Apply confirm dialog */}
          <Dialog open={applyConfirmOpen} onOpenChange={setApplyConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Application</DialogTitle>
                <DialogDescription>You can only apply to one topic. This action cannot be changed later.</DialogDescription>
              </DialogHeader>
              {selected && (
                <div className="text-sm space-y-2">
                  <p className="font-medium">Topic: {selected.title}</p>
                  <p>{selected.description}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={()=>setApplyConfirmOpen(false)}>Cancel</Button>
                <Button disabled={applying} onClick={()=>applyToTopic(selected)}>{applying? 'Applying...' : 'Yes, Apply'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

      {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <IconBook2 className="size-12 mx-auto mb-4 opacity-50" />
        <div>No topics found{scopeFilter==='mine' ? ' (you have not applied to a topic yet)' : ''}</div>
            </div>
          )}

          {/* Details Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Topic Details</DialogTitle>
                <DialogDescription>Full information about this topic.</DialogDescription>
              </DialogHeader>
              {selected && (
                <div className="grid gap-3 py-2 text-sm">
                  <div><span className="font-medium">Title:</span> {selected.title}</div>
                  <div><span className="font-medium">Description:</span> {selected.description || '-'}</div>
                  <div><span className="font-medium">Creator:</span> {selected.creatorName || '-'} ({selected.creatorEmail || '-'})</div>
                  <div><span className="font-medium">Department:</span> {(selected.department || '').toString().replaceAll('_',' ') || '-'}</div>
                  <div><span className="font-medium">Created At:</span> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
