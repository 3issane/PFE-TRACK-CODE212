import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBook, IconChartBar, IconClock, IconListDetails, IconListDetails as IconTopic } from "@tabler/icons-react";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { authHeader, getRole, getDashboardPath, clearAuth } from "@/auth";
import { useNavigate } from "react-router-dom";

// Student dashboard: focuses on student's own topics (assigned/applied), own reports, and upcoming schedule events.

const StudentDashboard = () => {
  const navigate = useNavigate();
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080";
  const [myTopicsCount, setMyTopicsCount] = useState(0); // topics student applied/assigned (should be 0 or 1)
  const [myTopicTitle, setMyTopicTitle] = useState("—");
  const [reportsCount, setReportsCount] = useState(0); // student's own reports
  const [upcomingCount, setUpcomingCount] = useState(0); // upcoming schedule items relevant to student (all for now)
  const [recentTopics, setRecentTopics] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(()=> {
    const role = getRole();
    if (role !== "STUDENT") { navigate(getDashboardPath(), { replace:true }); return; }
  fetchMyTopicAssignment();
    fetchMyReports();
    fetchUpcomingSchedules();
  },[]);

  // No derived student count needed for student dashboard.

  // Fetch topics relevant to this student (assuming backend supports ?assigned=true or fallback to all then filter by assignment info if available)
  const fetchMyTopicAssignment = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/topics/my-topic`, { headers:{...authHeader()} });
      if (res.status === 401) { clearAuth(); navigate('/login',{replace:true}); return; }
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.topicId) {
        setMyTopicsCount(1);
        setMyTopicTitle(data.title || 'My PFE Topic');
        setRecentTopics([{ id: data.topicId, title: data.title, createdAt: data.assignedAt, department: null }]);
      } else {
        setMyTopicsCount(0);
        setMyTopicTitle('No Topic Selected');
        setRecentTopics([]);
      }
    } catch {}
  };

  const fetchMyReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports?scope=mine`, { headers:{...authHeader()} });
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data)? data: [];
      setReportsCount(arr.length);
      setRecentReports(arr.sort((a,b)=> new Date(b.submissionDate||0)-new Date(a.submissionDate||0)).slice(0,5));
    } catch {}
  };

  const fetchUpcomingSchedules = async () => {
    try {
  const res = await fetch(`${API_BASE}/api/schedules`, { headers:{...authHeader()} });
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data)? data: [];
      // Filter future dates
      const now = new Date();
      const upcoming = arr.filter(s => s.date && new Date(s.date) >= new Date(now.toDateString()));
      setUpcoming(upcoming.sort((a,b)=> new Date(a.date)-new Date(b.date)).slice(0,5));
      setUpcomingCount(upcoming.length);
    } catch {}
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of your topics, reports, and schedule.</p>
            </div>
          </div>

          <SectionCards
            usersCount={0}
            reportsCount={reportsCount}
            topicsCount={myTopicsCount}
            schedulesCount={upcomingCount}
            firstOverride={{
              label: 'My PFE Topic',
              value: myTopicTitle,
              hint: myTopicsCount ? 'You have selected a topic' : 'You have not applied to a topic yet',
              Icon: IconTopic
            }}
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Your frequent tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { title: "Topics", desc: "View assigned/applied topics", icon: IconListDetails, to: "/student/topics" },
                  { title: "Reports", desc: "Manage your reports", icon: IconChartBar, to: "/student/reports" },
                  { title: "Schedule", desc: "View schedule", icon: IconClock, to: "/student/schedule" },
                  { title: "Profile", desc: "Manage your profile", icon: IconBook, to: "/student/profile" },
                ].map((a, idx) => (
                  <button key={idx} onClick={()=>navigate(a.to)} className="group rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition p-3 text-left flex flex-col gap-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Topics</CardTitle>
                <CardDescription>Your latest topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentTopics.map(t => (
                  <div key={t.id} className="text-sm p-2 rounded-md border bg-muted/30">
                    <p className="font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.department || '—'} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                ))}
                {recentTopics.length===0 && <div className="text-xs text-muted-foreground">No topics.</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Reports</CardTitle>
                <CardDescription>Your last 5 reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentReports.map(r => (
                  <div key={r.id} className="text-sm p-2 rounded-md border bg-muted/30">
                    <p className="font-medium truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.type} · {r.status}</p>
                  </div>
                ))}
                {recentReports.length===0 && <div className="text-xs text-muted-foreground">No reports.</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Upcoming Schedule</CardTitle>
                <CardDescription>Next 5 events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.map(s => (
                  <div key={s.id} className="text-sm p-2 rounded-md border bg-muted/30">
                    <p className="font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.date} · {s.startTime}-{s.endTime}</p>
                  </div>
                ))}
                {upcoming.length===0 && <div className="text-xs text-muted-foreground">No upcoming items.</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default StudentDashboard;
