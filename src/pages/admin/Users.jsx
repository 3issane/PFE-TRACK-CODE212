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
import { IconUsers, IconSearch, IconPlus, IconTrash, IconDots, IconMail, IconCalendar, IconShield, IconUserCheck, IconSchool, IconEdit } from "@tabler/icons-react";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authHeader, clearAuth, getRole, getDashboardPath } from "@/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080";

function RoleBadge({ role }) {
  const r = (role || "").toUpperCase();
  if (r === "ADMIN") return <Badge variant="destructive">Admin</Badge>;
  if (r === "PROFESSOR") return <Badge>Professor</Badge>;
  return <Badge variant="secondary">Student</Badge>;
}

function RoleIcon({ role }) {
  const r = (role || "").toUpperCase();
  if (r === "ADMIN") return <IconShield className="size-4 text-red-500" />;
  if (r === "PROFESSOR") return <IconUserCheck className="size-4 text-blue-500" />;
  return <IconSchool className="size-4 text-green-500" />;
}

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", role: "student", password: "", confirmPassword: "" });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState({ id: null, role: "", firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [verifiedAdmin, setVerifiedAdmin] = useState(false);

  useEffect(() => {
    // server-side verify role before hitting admin endpoints
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { ...authHeader() } });
        if (res.status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) {
          navigate(getDashboardPath(), { replace: true });
          return;
        }
        const me = await res.json();
        if ((me?.role || "") !== "ADMIN") {
          navigate(getDashboardPath(), { replace: true });
          return;
        }
        setVerifiedAdmin(true);
        fetchUsers();
      } catch (e) {
        console.error(e);
        navigate(getDashboardPath(), { replace: true });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (res.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        // Not an admin; keep session but bounce back
        navigate(getDashboardPath(), { replace: true });
        return;
      }
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users
      .filter((u) => {
        if (!term) return true;
        return (
          (u.firstName || "").toLowerCase().includes(term) ||
          (u.lastName || "").toLowerCase().includes(term) ||
          (u.email || "").toLowerCase().includes(term)
        );
      })
      .filter((u) => {
        if (roleFilter === "all") return true;
        return (u.role || "").toLowerCase() === roleFilter.toLowerCase();
      });
  }, [users, searchTerm, roleFilter]);

  async function handleDelete(u) {
    const role = (u.role || "").toUpperCase();
    if (!window.confirm(`Delete ${u.firstName || ""} ${u.lastName || ""}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${role}/${u.id}` , {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (res.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        alert("Access denied: admin privileges required");
        return;
      }
      if (!res.ok) throw new Error("Delete failed");
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to delete user");
    }
  }

  async function handleCreate() {
    try {
      // simple validation
      if (!newUser.password || newUser.password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      if (newUser.password !== newUser.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      const payload = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
      };
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        alert("Access denied: admin privileges required");
        return;
      }
      if (!res.ok) throw new Error("Create failed");
  setIsCreateOpen(false);
  setNewUser({ firstName: "", lastName: "", email: "", role: "student", password: "", confirmPassword: "" });
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to create user");
    }
  }

  function openEdit(u) {
    setEditUser({
      id: u.id,
      role: (u.role || "").toLowerCase(),
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsEditOpen(true);
  }

  async function handleUpdate() {
    try {
      if (!editUser.id || !editUser.role) return;
      if (editUser.password && editUser.password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      if (editUser.password && editUser.password !== editUser.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      const payload = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        password: editUser.password || undefined,
      };
      const res = await fetch(`${API_BASE}/api/admin/users/${(editUser.role || "").toUpperCase()}/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        alert("Access denied: admin privileges required");
        return;
      }
      if (!res.ok) throw new Error("Update failed");
      setIsEditOpen(false);
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to update user");
    }
  }

  function exportUsers() {
    const rows = [["First Name","Last Name","Email","Role","Created At"], ...filtered.map(u => [
      u.firstName || "",
      u.lastName || "",
      u.email || "",
      u.role || "",
      u.createdAt || ""
    ])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
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
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage all system users, roles, and permissions.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportUsers}>
                <IconUsers className="size-4 mr-2" /> Export
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <IconPlus className="size-4 mr-2" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>Add a new user with a role.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Repeat Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={newUser.confirmPassword}
                          onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input className="pl-9" placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="professor">Professors</SelectItem>
                      <SelectItem value="admin">Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Users ({filtered.length})</span>
                <Badge variant="outline">{users.length} total users</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">User</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Created</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u) => (
                        <tr key={`${u.role}-${u.id}`} className="border-b hover:bg-accent/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <RoleIcon role={u.role} />
                              </div>
                              <div>
                                <div className="font-medium">{u.firstName} {u.lastName}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4"><RoleBadge role={u.role} /></td>
                          <td className="p-4">
                            <div className="flex items-center text-sm">
                              <IconMail className="size-3 mr-1 text-muted-foreground" /> {u.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <IconCalendar className="size-3 mr-1" />
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                            </div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <IconDots className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEdit(u)}>
                                  <IconEdit className="size-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(u)}>
                                  <IconTrash className="size-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <IconUsers className="size-10 mx-auto mb-2 opacity-30" />
                      No users found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details. Leave password blank to keep unchanged.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input id="editFirstName" value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input id="editLastName" value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input id="editEmail" type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPassword">New Password</Label>
                <Input id="editPassword" type="password" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editConfirmPassword">Repeat Password</Label>
                <Input id="editConfirmPassword" type="password" value={editUser.confirmPassword} onChange={(e) => setEditUser({ ...editUser, confirmPassword: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

// Edit dialog mounted at root so it overlays correctly
// We place it after the component to keep file simple


