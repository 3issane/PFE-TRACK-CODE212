import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBook, IconClock, IconChartBar, IconUsers, IconUser, IconReport, IconListDetails } from "@tabler/icons-react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// Temp data sources; wire to backend later
// import topics from "@/app/dashboard/data.json";
import { useEffect, useState } from "react";
import { authHeader, getRole, getDashboardPath, clearAuth } from "@/auth";
import { useNavigate } from "react-router-dom";

const AdminDash = () => {
  const navigate = useNavigate();
  const [usersCount, setUsersCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [professorsCount, setProfessorsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [topicsCount, setTopicsCount] = useState(0);
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080";
  const totalProjects = 0; // TODO: replace when projects API exists
  const activeProjects = 0; // TODO: replace when projects API exists
  const completedProjects = 0; // TODO: replace when projects API exists
  const [schedulesCount, setSchedulesCount] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchUserStats = async () => {
      // route guard: only ADMIN should remain on this page
      const role = getRole();
      if (role !== "ADMIN") {
        navigate(getDashboardPath(), { replace: true });
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/admin/user-stats`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
        });
        if (res.status === 401 || res.status === 403) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) return; // silently keep zeros for other errors
        const data = await res.json();
        setUsersCount(data.total ?? 0);
        setAdminsCount(data.admins ?? 0);
        setStudentsCount(data.students ?? 0);
        setProfessorsCount(data.professors ?? 0);
      } catch (e) {
        // silently fail for now
      }
    };
    const fetchTopicCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/topics`, { headers: { ...authHeader() } });
        if (res.status === 401 || res.status === 403) return; // not critical
        if (!res.ok) return;
        const data = await res.json();
        setTopicsCount(Array.isArray(data) ? data.length : 0);
      } catch {}
    };
    const fetchReportCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reports/count`, { headers: { ...authHeader() } });
        if (res.status === 401 || res.status === 403) return;
        if (!res.ok) return;
        const data = await res.json();
        setReportsCount(Number(data.total) || 0);
      } catch {}
    };
    const fetchScheduleCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/schedule-count`, { headers: { ...authHeader() } });
        if (!res.ok) return;
        const data = await res.json();
        setSchedulesCount(Number(data.total) || 0);
      } catch {}
    };
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/recent`, { headers: { ...authHeader() } });
        if (!res.ok) return;
        const data = await res.json();
        setRecent(Array.isArray(data)? data : []);
      } catch {}
    };
    fetchUserStats();
    fetchTopicCount();
    fetchReportCount();
    fetchScheduleCount();
    fetchRecent();
  }, [navigate]);
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
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of platform activity.</p>
            </div>
          </div>

          {/* Top stats */}
          <SectionCards
            usersCount={{ total: usersCount, admins: adminsCount, students: studentsCount, professors: professorsCount }}
            reportsCount={reportsCount}
            topicsCount={topicsCount}
            schedulesCount={schedulesCount}
          />

          {/* Quick Actions (framed) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common admin operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { title: "Manage Users", desc: "Add or edit users", icon: IconUsers, to: "/admin/users" },
                  { title: "Topics", desc: "Browse topics", icon: IconBook, to: "/admin/topics" },
                  { title: "Reports", desc: "Monitor reports", icon: IconChartBar, to: "/admin/reports" },
                  { title: "Schedules", desc: "Manage events", icon: IconClock, to: "/admin/schedule" },
                ].map((a, idx) => (
                  <button
                    key={idx}
                    onClick={()=>navigate(a.to)}
                    className="group rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition p-3 text-left flex flex-col gap-2"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <a.icon className="size-4 text-primary group-hover:scale-110 transition" />
                    </div>
                    <div className="text-sm font-medium leading-tight line-clamp-1">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">{a.desc}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><IconUser className="size-4"/>Recent Users</CardTitle>
                <CardDescription>Last 5 registered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recent.filter(r=>r.type==='USER').slice(0,5).map(u=> (
                  <div key={'user'+u.id} className="text-sm flex items-center gap-3 p-2 rounded-md border bg-muted/30">
                    <IconUser className="size-4 text-primary"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.secondary}</p>
                    </div>
                  </div>
                ))}
                {recent.filter(r=>r.type==='USER').length===0 && <div className="text-xs text-muted-foreground">No users.</div>}
              </CardContent>
            </Card>
            {/* Recent Reports */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><IconReport className="size-4"/>Recent Reports</CardTitle>
                <CardDescription>Last 5 uploads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recent.filter(r=>r.type==='REPORT').slice(0,5).map(rep=> (
                  <div key={'report'+rep.id} className="text-sm flex items-center gap-3 p-2 rounded-md border bg-muted/30">
                    <IconReport className="size-4 text-primary"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rep.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{rep.secondary}</p>
                    </div>
                  </div>
                ))}
                {recent.filter(r=>r.type==='REPORT').length===0 && <div className="text-xs text-muted-foreground">No reports.</div>}
              </CardContent>
            </Card>
            {/* Recent Topics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><IconListDetails className="size-4"/>Recent Topics</CardTitle>
                <CardDescription>Last 5 created</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recent.filter(r=>r.type==='TOPIC').slice(0,5).map(t=> (
                  <div key={'topic'+t.id} className="text-sm flex items-center gap-3 p-2 rounded-md border bg-muted/30">
                    <IconListDetails className="size-4 text-primary"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.secondary}</p>
                    </div>
                  </div>
                ))}
                {recent.filter(r=>r.type==='TOPIC').length===0 && <div className="text-xs text-muted-foreground">No topics.</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDash;
