import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  BookOpen, 
  Upload, 
  Calendar, 
  Award, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Users,
  Target,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  
  // Current project data - this should ideally come from an API call
  const currentProject = {
    title: "AI-Based Recommendation System",
    supervisor: "Prof. Ahmed Hassan",
    startDate: "2024-01-15",
    endDate: "2024-05-15",
    progress: 65,
    status: "In Progress"
  };
  const stats = [
    {
      title: "Current Project",
      value: "AI-Based Recommendation System",
      icon: BookOpen,
      description: "In Progress",
      color: "text-primary"
    },
    {
      title: "Progress",
      value: "65%",
      icon: TrendingUp,
      description: "Mid-term phase",
      color: "text-success"
    },
    {
      title: "Reports Submitted",
      value: "2/4",
      icon: FileText,
      description: "Initial & Mid-term",
      color: "text-warning"
    },
    {
      title: "Current Grade",
      value: "A-",
      icon: Award,
      description: "85/100",
      color: "text-primary"
    }
  ];

  const recentActivities = [
    {
      type: "submission",
      title: "Mid-term Report Submitted",
      description: "Submitted on March 15, 2024",
      time: "2 days ago",
      status: "completed"
    },
    {
      type: "feedback",
      title: "Feedback Received",
      description: "Prof. Ahmed provided feedback on your proposal",
      time: "1 week ago",
      status: "info"
    },
    {
      type: "meeting",
      title: "Supervisor Meeting",
      description: "Discussed project progress and next steps",
      time: "1 week ago",
      status: "completed"
    },
    {
      type: "deadline",
      title: "Final Report Due",
      description: "Submit your final report by May 15, 2024",
      time: "In 2 months",
      status: "pending"
    }
  ];

  const upcomingDeadlines = [
    {
      title: "Progress Presentation",
      date: "April 1, 2024",
      type: "Presentation",
      status: "upcoming",
      daysLeft: 15
    },
    {
      title: "Final Report Submission",
      date: "May 15, 2024",
      type: "Report",
      status: "upcoming",
      daysLeft: 60
    },
    {
      title: "Thesis Defense",
      date: "June 10, 2024",
      type: "Defense",
      status: "scheduled",
      daysLeft: 85
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "info":
        return <MessageSquare className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status, daysLeft) => {
    if (daysLeft !== undefined) {
      if (daysLeft <= 7) return "bg-destructive text-destructive-foreground";
      if (daysLeft <= 30) return "bg-warning text-warning-foreground";
      return "bg-primary text-primary-foreground";
    }
    
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "upcoming":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {currentUser?.firstName || 'Student'}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your PFE project progress and upcoming deadlines.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    {stat.title}
                  </CardDescription>
                  {React.createElement(stat.icon, { className: `w-5 h-5 ${stat.color}` })}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Project */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Current Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">AI-Based Recommendation System</h3>
                    <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Developing an intelligent recommendation system using machine learning algorithms 
                    for e-commerce applications. Supervised by Prof. Ahmed Khouani.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                {currentProject && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Supervisor</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">{currentProject.supervisor || 'Not Assigned'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Defense Date</p>
                      <p className="text-sm text-muted-foreground">
                        {currentProject.endDate ? new Date(currentProject.endDate).toLocaleDateString() : 'Not Set'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" asChild>
                    <Link to="/dashboard/student/reports">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Report
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/student/messages">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Supervisor
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Your latest project updates and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link to="/dashboard/student/topics">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse PFE Topics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/student/reports">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Report
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/student/schedule">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/student/grades">
                    <Award className="w-4 h-4 mr-2" />
                    Check Grades
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/student/profile">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Upcoming Deadlines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="space-y-2 p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{deadline.title}</h4>
                        <Badge 
                          className={`text-xs ${getStatusColor(deadline.status, deadline.daysLeft)}`}
                        >
                          {deadline.daysLeft} days
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{deadline.date}</p>
                        <p className="text-xs text-muted-foreground">{deadline.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;