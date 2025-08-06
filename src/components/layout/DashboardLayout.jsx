import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { 
  BookOpen, 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Award,
  Upload,
  Users,
  BarChart3,
  GraduationCap,
  UserCheck,
  Shield
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { useAuth } from "../../contexts/AuthContext";

const DashboardLayout = ({ children, role = "student" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavigationItems = () => {
    const commonItems = [
      { icon: Home, label: "Dashboard", path: `/dashboard/${role}` },
      { icon: User, label: "Profile", path: `/dashboard/${role}/profile` },
      { icon: Settings, label: "Settings", path: `/dashboard/${role}/settings` },
    ];

    const roleSpecificItems = {
      student: [
        { icon: BookOpen, label: "PFE Topics", path: "/dashboard/student/topics" },
        { icon: Upload, label: "Reports", path: "/dashboard/student/reports" },
        { icon: Award, label: "Grades", path: "/dashboard/student/grades" },
        { icon: Calendar, label: "Schedule", path: "/dashboard/student/schedule" },
      ],
      professor: [
        { icon: Users, label: "My Students", path: "/dashboard/professor/students" },
        { icon: BookOpen, label: "Manage Topics", path: "/dashboard/professor/topics" },
        { icon: FileText, label: "Submissions", path: "/dashboard/professor/submissions" },
        { icon: Award, label: "Evaluations", path: "/dashboard/professor/evaluations" },
      ],
      admin: [
        { icon: Users, label: "User Management", path: "/dashboard/admin/users" },
        { icon: BarChart3, label: "Analytics", path: "/dashboard/admin/analytics" },
        { icon: BookOpen, label: "All Projects", path: "/dashboard/admin/projects" },
        { icon: Calendar, label: "Schedules", path: "/dashboard/admin/schedules" },
      ]
    };

    return [
      ...commonItems.slice(0, 1), // Dashboard first
      ...roleSpecificItems[role],
      ...commonItems.slice(1) // Profile, Settings last
    ];
  };

  const getRoleInfo = () => {
    switch (role) {
      case "student":
        return { 
          icon: GraduationCap, 
          label: "Student", 
          color: "bg-primary text-primary-foreground",
          name: currentUser?.firstName + " " + currentUser?.lastName || "Ahmed Benali",
          email: currentUser?.email || "ahmed.benali@student.university.edu"
        };
      case "professor":
        return { 
          icon: UserCheck, 
          label: "Professor", 
          color: "bg-success text-success-foreground",
          name: currentUser?.firstName + " " + currentUser?.lastName || "Dr. Fatima Zahra",
          email: currentUser?.email || "f.zahra@university.edu"
        };
      case "admin":
        return { 
          icon: Shield, 
          label: "Administrator", 
          color: "bg-warning text-warning-foreground",
          name: currentUser?.firstName + " " + currentUser?.lastName || "Sarah Admin",
          email: currentUser?.email || "admin@university.edu"
        };
    }
  };

  const roleInfo = getRoleInfo();
  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PFETrack</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>{roleInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{roleInfo.name}</p>
                <Badge className={`text-xs ${roleInfo.color}`}>
                  {roleInfo.icon && React.createElement(roleInfo.icon, { className: "w-3 h-3 mr-1" })}
                  {roleInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon && React.createElement(item.icon, { className: "w-4 h-4" })}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              <div className="relative w-96 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, reports, students..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-destructive"></Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start p-4">
                    <div className="font-medium">Report Due Soon</div>
                    <div className="text-sm text-muted-foreground">Mid-term report due in 3 days</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-4">
                    <div className="font-medium">New Message</div>
                    <div className="text-sm text-muted-foreground">Prof. Ahmed sent you feedback</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>{roleInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm">{roleInfo.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{roleInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{roleInfo.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/${role}/profile`} className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/${role}/settings`} className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;