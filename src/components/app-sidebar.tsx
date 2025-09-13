import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconReport,
  IconListDetails,
  IconCalendar,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { getRole } from "@/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const adminNav = [
  { title: "Dashboard", url: "/admin/dashboard", icon: IconDashboard },
  { title: "Users", url: "/admin/users", icon: IconUsers },
  { title: "Topics", url: "/admin/topics", icon: IconListDetails },
  { title: "Reports", url: "/admin/reports", icon: IconReport },
  { title: "Schedule", url: "/admin/schedule", icon: IconCalendar },
  { title: "Profile", url: "/admin/profile", icon: IconUserCircle },
]

const professorNav = [
  { title: "Dashboard", url: "/professor/dashboard", icon: IconDashboard },
  { title: "Topics", url: "/professor/topics", icon: IconListDetails },
  { title: "Reports", url: "/professor/reports", icon: IconReport },
  { title: "Schedule", url: "/professor/schedule", icon: IconCalendar },
  { title: "Profile", url: "/professor/profile", icon: IconUserCircle },
]

const studentNav = [
  { title: "Dashboard", url: "/student/dashboard", icon: IconDashboard },
  { title: "Topics", url: "/student/topics", icon: IconListDetails },
  { title: "Reports", url: "/student/reports", icon: IconReport },
  { title: "Report Check", url: "/student/report-check", icon: IconReport },
  { title: "Schedule", url: "/student/schedule", icon: IconCalendar },
  { title: "Profile", url: "/student/profile", icon: IconUserCircle },
]

const baseUser = {
  name: "User",
  email: "user@example.com",
  avatar: "/avatars/user.jpg",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const role = getRole()
  const items = React.useMemo(() => {
    if (role === "ADMIN") return adminNav
    if (role === "PROFESSOR") return professorNav
    if (role === "STUDENT") return studentNav
    return []
  }, [role])
  const home = role === "ADMIN" ? "/admin/dashboard" : role === "PROFESSOR" ? "/professor/dashboard" : role === "STUDENT" ? "/student/dashboard" : "/"
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={home}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">PFETrack</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
    <SidebarContent>
  <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
  <NavUser user={baseUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
