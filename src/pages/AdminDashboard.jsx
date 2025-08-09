import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Users, 
  BarChart3, 
  BookOpen, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Settings,
  Shield,
  Activity,
  Database,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalProfessors: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingReports: 0,
    systemHealth: 'Good'
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Current user:', localStorage.getItem('user'));
      console.log('Auth token:', localStorage.getItem('token'));
    
    // Fetch dashboard statistics with proper error handling
    const [usersResponse, projectsResponse] = await Promise.all([
      api.get('/users').catch(err => {
        console.error('Users API error:', err);
        return [];
      }),
      api.get('/projects').catch(err => {
        console.error('Projects API error:', err);
        return [];
      })
    ]);

    const users = Array.isArray(usersResponse) ? usersResponse : [];
    const projects = Array.isArray(projectsResponse) ? projectsResponse : [];

    console.log('Fetched users:', users); // Debug log
    console.log('Fetched projects:', projects); // Debug log

    // Calculate statistics
    const totalUsers = users.length;
    const totalStudents = users.filter(user => 
      user.roles?.some(role => role.name === 'ROLE_STUDENT')
    ).length;
    const totalProfessors = users.filter(user => 
      user.roles?.some(role => role.name === 'ROLE_PROFESSOR')
    ).length;
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const pendingReports = projects.filter(p => p.status === 'PENDING_REVIEW').length;

    setStats({
      totalUsers,
      totalStudents,
      totalProfessors,
      totalProjects,
      activeProjects,
      completedProjects,
      pendingReports,
      systemHealth: 'Good'
    });

    // TODO: Fetch real recent activities from API
    setRecentActivities([]);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Set default values in case of error
    setStats({
      totalUsers: 0,
      totalStudents: 0,
      totalProfessors: 0,
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      pendingReports: 0,
      systemHealth: 'Error'
    });
  } finally {
    setLoading(false);
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove system users',
      icon: Users,
      path: '/dashboard/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'View Analytics',
      description: 'System performance and usage statistics',
      icon: BarChart3,
      path: '/dashboard/admin/analytics',
      color: 'bg-green-500'
    },
    {
      title: 'Project Overview',
      description: 'Monitor all student projects',
      icon: BookOpen,
      path: '/dashboard/admin/projects',
      color: 'bg-purple-500'
    },
    {
      title: 'Schedule Management',
      description: 'Manage academic schedules and events',
      icon: Calendar,
      path: '/dashboard/admin/schedules',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {currentUser?.firstName || 'Administrator'}. Here's your system overview.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              System Status: {stats.systemHealth}
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStudents} students, {stats.totalProfessors} professors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProjects} total projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completedProjects / stats.totalProjects) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Reports awaiting review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activities and System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.description}</p>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Key metrics and system health indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Project Completion Rate</span>
                  <span>{Math.round((stats.completedProjects / stats.totalProjects) * 100)}%</span>
                </div>
                <Progress value={(stats.completedProjects / stats.totalProjects) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Users</span>
                  <span>{Math.round((stats.totalStudents + stats.totalProfessors) / stats.totalUsers * 100)}%</span>
                </div>
                <Progress value={(stats.totalStudents + stats.totalProfessors) / stats.totalUsers * 100} className="h-2" />
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    Healthy
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">API Services</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Running
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
