import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Award,
  Calendar,
  Clock,
  Target,
  Activity,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  BarChart
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminAnalytics = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 156,
      totalProjects: 45,
      completedProjects: 28,
      activeUsers: 142,
      averageGrade: 85.2,
      systemUptime: 99.8
    },
    userStats: {
      students: 120,
      professors: 25,
      admins: 3,
      newUsersThisMonth: 15,
      activeUsersToday: 89
    },
    projectStats: {
      inProgress: 17,
      completed: 28,
      pending: 8,
      overdue: 3,
      averageCompletionTime: 4.2
    },
    performance: {
      avgResponseTime: 245,
      successRate: 98.5,
      errorRate: 1.5,
      dailyActiveUsers: 89
    }
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // In a real application, you would fetch from multiple endpoints
      // const [usersResponse, projectsResponse, performanceResponse] = await Promise.all([
      //   api.get('/api/analytics/users'),
      //   api.get('/api/analytics/projects'),
      //   api.get('/api/analytics/performance')
      // ]);
      
      // For now, we'll simulate the data
      setTimeout(() => {
        setAnalytics({
          overview: {
            totalUsers: 156,
            totalProjects: 45,
            completedProjects: 28,
            activeUsers: 142,
            averageGrade: 85.2,
            systemUptime: 99.8
          },
          userStats: {
            students: 120,
            professors: 25,
            admins: 3,
            newUsersThisMonth: 15,
            activeUsersToday: 89
          },
          projectStats: {
            inProgress: 17,
            completed: 28,
            pending: 8,
            overdue: 3,
            averageCompletionTime: 4.2
          },
          performance: {
            avgResponseTime: 245,
            successRate: 98.5,
            errorRate: 1.5,
            dailyActiveUsers: 89
          }
        });
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analytics
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getChangeIndicator = (value, isPositive = true) => {
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${colorClass}`}>
        <Icon className="h-3 w-3 mr-1" />
        <span className="text-xs font-medium">{value}%</span>
      </div>
    );
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              System performance metrics and usage statistics.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
              {getChangeIndicator(8.2)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalProjects}</div>
              {getChangeIndicator(12.5)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((analytics.overview.completedProjects / analytics.overview.totalProjects) * 100)}%
              </div>
              {getChangeIndicator(5.1)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.activeUsers}</div>
              {getChangeIndicator(3.8)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.averageGrade}</div>
              {getChangeIndicator(2.3)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.systemUptime}%</div>
              {getChangeIndicator(0.2)}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Statistics
              </CardTitle>
              <CardDescription>
                User distribution and activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Students</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{analytics.userStats.students}</span>
                    <Badge variant="secondary">
                      {Math.round((analytics.userStats.students / analytics.overview.totalUsers) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={(analytics.userStats.students / analytics.overview.totalUsers) * 100} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Professors</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{analytics.userStats.professors}</span>
                    <Badge variant="secondary">
                      {Math.round((analytics.userStats.professors / analytics.overview.totalUsers) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={(analytics.userStats.professors / analytics.overview.totalUsers) * 100} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Administrators</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{analytics.userStats.admins}</span>
                    <Badge variant="secondary">
                      {Math.round((analytics.userStats.admins / analytics.overview.totalUsers) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={(analytics.userStats.admins / analytics.overview.totalUsers) * 100} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.userStats.newUsersThisMonth}</div>
                    <div className="text-xs text-gray-500">New this month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.userStats.activeUsersToday}</div>
                    <div className="text-xs text-gray-500">Active today</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Project Statistics
              </CardTitle>
              <CardDescription>
                Project status distribution and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.projectStats.inProgress}</div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.projectStats.completed}</div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analytics.projectStats.pending}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analytics.projectStats.overdue}</div>
                  <div className="text-sm text-red-700">Overdue</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Completion Time</span>
                  <div className="text-right">
                    <div className="text-lg font-bold">{analytics.projectStats.averageCompletionTime} months</div>
                    <div className="text-xs text-gray-500">Per project</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              System Performance
            </CardTitle>
            <CardDescription>
              Technical performance metrics and system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.performance.avgResponseTime}ms</div>
                <div className="text-sm text-gray-500">Avg Response Time</div>
                <div className="mt-2">
                  {getChangeIndicator(5.2, false)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analytics.performance.successRate}%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
                <div className="mt-2">
                  {getChangeIndicator(1.8)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{analytics.performance.errorRate}%</div>
                <div className="text-sm text-gray-500">Error Rate</div>
                <div className="mt-2">
                  {getChangeIndicator(0.3, false)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{analytics.performance.dailyActiveUsers}</div>
                <div className="text-sm text-gray-500">Daily Active Users</div>
                <div className="mt-2">
                  {getChangeIndicator(12.4)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                User Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Chart visualization would be implemented here</p>
                  <p className="text-sm">Using libraries like Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Project Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Pie chart visualization would be implemented here</p>
                  <p className="text-sm">Showing project status distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;