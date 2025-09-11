import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconDashboard,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { authHeader, clearAuth, getDashboardPath } from "@/auth"

type NavUserInfo = {
  name: string
  email: string
  avatar: string
}

export function NavUser({
  user,
}: {
  user: NavUserInfo
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const [info, setInfo] = React.useState<NavUserInfo>(user)

  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8080"

  React.useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        // Try backend profile endpoint (assumption: /api/auth/me returns { name, email, avatar? })
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
        })
        if (res.status === 401) {
          clearAuth()
          navigate("/login", { replace: true })
          return
        }
        if (res.status === 403) {
          // Insufficient privileges for some setups; don't clear session
          return
        }
        if (res.ok) {
          const data = (await res.json()) as Partial<NavUserInfo>
          if (!cancelled) {
            setInfo(prev => ({
              name: data.name || prev.name,
              email: data.email || prev.email,
              avatar: data.avatar || prev.avatar,
            }))
          }
          return
        }
      } catch {}

      // Fallback: decode JWT locally to get email/name if present
      try {
        const token = localStorage.getItem("authToken") || ""
        const payload = token.split(".")[1]
        if (payload) {
          const json = JSON.parse(
            decodeURIComponent(
              atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
                .split("")
                .map(c => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join("")
            )
          ) as Record<string, any>
          const email = String(json.email || json.sub || info.email || "")
          const name = String(
            json.name || info.name || (email ? email.split("@")[0] : "")
          )
          if (!cancelled && (email || name)) {
            setInfo(prev => ({ ...prev, name, email }))
          }
        }
      } catch {}
    }

    fetchUser()
    return () => {
      cancelled = true
    }
  }, [API_BASE])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={info.avatar} alt={info.name} />
                <AvatarFallback className="rounded-lg">
                  {info.name?.[0]?.toUpperCase() || info.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{info.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {info.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={info.avatar} alt={info.name} />
                  <AvatarFallback className="rounded-lg">
                    {info.name?.[0]?.toUpperCase() || info.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{info.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {info.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate(getDashboardPath()); }}>
                <IconDashboard />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate("/admin/profile"); }}>
                <IconUserCircle />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); clearAuth(); navigate("/login"); }}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
