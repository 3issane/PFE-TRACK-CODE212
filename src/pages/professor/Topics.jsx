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
import { IconBook2, IconSearch, IconFilter, IconPlus, IconEdit, IconTrash, IconDots, IconCalendar, IconUser } from "@tabler/icons-react";
import { authHeader, clearAuth, getRole, getDashboardPath } from "@/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080";

export default function ProfessorTopics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all"); // all | mine
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", department: "" });
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState("");

  useEffect(() => {
    fetchTopics();
    // prefetch professors for admin to assign
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/professors`, { headers: { ...authHeader() } });
        if (res.ok) {
          const data = await res.json();
          setProfessors(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [scopeFilter]);

  async function fetchTopics() {
    try {
      setLoading(true);
      const params = scopeFilter === "mine" ? "?mine=true" : "";
      const res = await fetch(`${API_BASE}/api/topics${params}`, { headers: { ...authHeader() } });
      if (res.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        navigate(getDashboardPath(), { replace: true });
        return;
      }
      if (!res.ok) throw new Error("Failed to load topics");
      const data = await res.json();
      setTopics(Array.isArray(data) ? data : []);
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

  async function handleCreate() {
    try {
      if (!form.title.trim()) { alert("Title is required"); return; }
      const role = localStorage.getItem("role");
  const payload = { title: form.title, description: form.description, department: form.department || null };
      if (role === "ADMIN" && selectedProfessorId) {
        payload.creatorProfessorId = Number(selectedProfessorId);
      }
      const res = await fetch(`${API_BASE}/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { clearAuth(); navigate("/login", { replace: true }); return; }
      if (res.status === 403) { alert("Only professors/admins can create topics"); return; }
      if (!res.ok) throw new Error("Create failed");
      setIsCreateOpen(false);
  setForm({ title: "", description: "" });
  setSelectedProfessorId("");
      await fetchTopics();
    } catch (e) {
      console.error(e);
      alert("Failed to create topic");
    }
  }

  function openEdit(t) {
    setSelected(t);
    setForm({ title: t.title || "", description: t.description || "", department: t.department || "" });
    setIsEditOpen(true);
  }

  function openView(t) {
    setSelected(t);
    setIsViewOpen(true);
    // fetch applicants for this topic (admin/professor only)
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/topics/${t.id}/applicants`, { headers: { ...authHeader() } });
        if (!res.ok) { setApplicants([]); return; }
        const data = await res.json();
        setApplicants(Array.isArray(data) ? data : []);
      } catch {
        setApplicants([]);
      }
    })();
  }

  // Persist update via backend
  async function handleUpdate() {
    if (!selected) return;
    try {
      const res = await fetch(`${API_BASE}/api/topics/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ title: form.title, description: form.description, department: form.department || null }),
      });
      if (res.status === 401) { clearAuth(); navigate("/login", { replace: true }); return; }
      if (res.status === 403) { alert("Not allowed to update this topic"); return; }
      if (!res.ok) throw new Error("Update failed");
      setIsEditOpen(false);
      setSelected(null);
      await fetchTopics();
    } catch (e) {
      console.error(e);
      alert("Failed to update topic");
    }
  }

  // Persist delete via backend
  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}`, { method: "DELETE", headers: { ...authHeader() } });
      if (res.status === 401) { clearAuth(); navigate("/login", { replace: true }); return; }
      if (res.status === 403) { alert("Not allowed to delete this topic"); return; }
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      await fetchTopics();
    } catch (e) {
      console.error(e);
      alert("Failed to delete topic");
    }
  }

  function exportTopics() {
    const rows = filtered.map(t => ({
      title: t.title,
      description: t.description,
      creator: t.creatorName,
      creatorEmail: t.creatorEmail,
      createdAt: t.createdAt,
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "topics.json";
    a.click();
    URL.revokeObjectURL(url);
  }

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
              <h1 className="text-2xl font-bold">My Topics</h1>
              <p className="text-muted-foreground mt-1">Create and manage the topics you own.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportTopics}>
                <IconBook2 className="size-4 mr-2" /> Export
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <IconPlus className="size-4 mr-2" /> Create Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Topic</DialogTitle>
                    <DialogDescription>Add a new topic to the system.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="tTitle">Title</Label>
                      <Input id="tTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tDesc">Description</Label>
                      <Textarea id="tDesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tDept">Department</Label>
                      <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                        <SelectTrigger id="tDept">
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {["COMPUTER_SCIENCE","MATHEMATICS","PHYSICS","CHEMISTRY","ELECTRICAL_ENGINEERING","MECHANICAL_ENGINEERING","CIVIL_ENGINEERING","BIOLOGY","ECONOMICS","MANAGEMENT"].map(d => (
                            <SelectItem key={d} value={d}>{d.replaceAll('_',' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {localStorage.getItem("role") === "ADMIN" && (
                      <div className="space-y-2">
                        <Label>Assigned Professor</Label>
                        <Select value={selectedProfessorId} onValueChange={setSelectedProfessorId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a professor" />
                          </SelectTrigger>
                          <SelectContent>
                            {professors.map(p => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.firstName} {p.lastName} ({p.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="mine">My Topics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topics grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <Card key={t.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{t.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Topic</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <IconDots className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEdit(t)}>
                          <IconEdit className="size-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(t.id)}>
                          <IconTrash className="size-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">{t.description}</CardDescription>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center"><IconUser className="size-4 mr-2" /> {t.creatorName || ""}</div>
                    <div className="flex items-center"><IconCalendar className="size-4 mr-2" /> {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</div>
                    <div className="flex items-center"><IconBook2 className="size-4 mr-2" /> {(t.department || "").toString().replaceAll('_',' ') || "-"}</div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => openView(t)}>View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <IconBook2 className="size-12 mx-auto mb-4 opacity-50" />
              <div>No topics found</div>
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Topic</DialogTitle>
                <DialogDescription>Update topic details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="etTitle">Title</Label>
                  <Input id="etTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etDesc">Description</Label>
                  <Textarea id="etDesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etDept">Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                    <SelectTrigger id="etDept">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {["COMPUTER_SCIENCE","MATHEMATICS","PHYSICS","CHEMISTRY","ELECTRICAL_ENGINEERING","MECHANICAL_ENGINEERING","CIVIL_ENGINEERING","BIOLOGY","ECONOMICS","MANAGEMENT"].map(d => (
                        <SelectItem key={d} value={d}>{d.replaceAll('_',' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
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
                  <div>
                    <span className="font-medium">Applicants:</span>
                    <div className="mt-2 space-y-1">
                      {applicants.length === 0 ? (
                        <div className="text-muted-foreground">No applicants yet.</div>
                      ) : (
                        applicants.map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <div>{s.firstName} {s.lastName} ({s.email})</div>
                            <div className="text-xs text-muted-foreground">{s.assignedAt ? new Date(s.assignedAt).toLocaleString() : ''}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
