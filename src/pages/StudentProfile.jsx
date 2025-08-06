import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Edit,
  Settings,
  GraduationCap,
  Clock,
  Star,
  FileText,
  Users,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const StudentProfile = () => {
  const { currentUser, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile
        const profileResponse = await fetch('/api/student-profiles/my-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (profileResponse.ok) {
          try {
            const profile = await profileResponse.json();
            setProfileData(profile);
          } catch (jsonError) {
            console.error('Error parsing profile JSON:', jsonError);
            // Fallback to mock data if JSON parsing fails
            setProfileData({
              user: currentUser,
              studentId: 'STU001',
              department: 'Computer Science',
              academicYear: '3rd Year',
              gpa: 3.75,
              creditsCompleted: 90,
              totalCreditsRequired: 180,
              phone: '+212 770472728',
              address: 'Ensa Marrakech ,Abdelkarim Elkhattabi',
              bio: 'Computer Science student passionate about software development and AI.'
            });
          }
        } else {
          // If no profile exists or API fails, use mock data
          console.warn('Profile API failed or no profile exists. Using mock data.');
          setProfileData({
            user: currentUser,
            studentId: 'STU001',
            department: 'Computer Science',
            academicYear: '3rd Year',
            gpa: 3.75,
            creditsCompleted: 90,
            totalCreditsRequired: 180,
            phone: '+212 770472728',
            address: '123 University Ave, Campus City',
            bio: 'Computer Science student passionate about software development and AI.'
          });
        }
        
        // Fetch achievements
        const achievementsResponse = await fetch('/api/achievements/my-achievements', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (achievementsResponse.ok) {
          try {
            const achievementsData = await achievementsResponse.json();
            setAchievements(achievementsData.slice(0, 3)); // Show only recent 3
          } catch (jsonError) {
            console.error('Error parsing achievements JSON:', jsonError);
            // Fallback to mock data if JSON parsing fails
            setAchievements([
              {
                id: 1,
                title: 'Dean\'s List',
                description: 'Achieved GPA above 3.5 for consecutive semesters',
                date: '2024-01-15',
                type: 'academic'
              },
              {
                id: 2,
                title: 'Programming Contest Winner',
                description: 'First place in university coding competition',
                date: '2023-11-20',
                type: 'competition'
              }
            ]);
          }
        } else {
          // If achievements API fails, use mock data
          setAchievements([
            {
              id: 1,
              title: 'Dean\'s List',
              description: 'Achieved GPA above 3.5 for consecutive semesters',
              date: '2024-01-15',
              type: 'academic'
            },
            {
              id: 2,
              title: 'Programming Contest Winner',
              description: 'First place in university coding competition',
              date: '2023-11-20',
              type: 'competition'
            }
          ]);
        }
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects/my-projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (projectsResponse.ok) {
          try {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS'));
          } catch (jsonError) {
            console.error('Error parsing projects JSON:', jsonError);
            // Fallback to mock data if JSON parsing fails
            setProjects([
              {
                id: 1,
                title: 'Student Management System',
                description: 'Full-stack web application for managing student records',
                status: 'completed',
                grade: 'A+',
                submissionDate: '2024-01-10'
              },
              {
                id: 2,
                title: 'AI Chatbot',
                description: 'Natural language processing chatbot using machine learning',
                status: 'in-progress',
                grade: null,
                submissionDate: null
              }
            ]);
          }
        } else {
          // If projects API fails, use mock data
          setProjects([
            {
              id: 1,
              title: 'Student Management System',
              description: 'Full-stack web application for managing student records',
              status: 'completed',
              grade: 'A+',
              submissionDate: '2024-01-10'
            },
            {
              id: 2,
              title: 'AI Chatbot',
              description: 'Natural language processing chatbot using machine learning',
              status: 'in-progress',
              grade: null,
              submissionDate: null
            }
          ]);
        }
        
        // Fetch grades for GPA calculation
        const gradesResponse = await fetch('/api/grades/my-grades', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (gradesResponse.ok) {
          try {
            const gradesData = await gradesResponse.json();
            setGrades(gradesData);
          } catch (jsonError) {
            console.error('Error parsing grades JSON:', jsonError);
            // Fallback to mock data if JSON parsing fails
            setGrades([
              { course: 'Data Structures', grade: 'A', credits: 3, semester: 'Fall 2023' },
              { course: 'Algorithms', grade: 'A-', credits: 3, semester: 'Fall 2023' },
              { course: 'Database Systems', grade: 'B+', credits: 3, semester: 'Spring 2024' },
              { course: 'Web Development', grade: 'A', credits: 3, semester: 'Spring 2024' }
            ]);
          }
        } else {
          // If grades API fails, use mock data
          setGrades([
            { course: 'Data Structures', grade: 'A', credits: 3, semester: 'Fall 2023' },
            { course: 'Algorithms', grade: 'A-', credits: 3, semester: 'Fall 2023' },
            { course: 'Database Systems', grade: 'B+', credits: 3, semester: 'Spring 2024' },
            { course: 'Web Development', grade: 'A', credits: 3, semester: 'Spring 2024' }
          ]);
        }
        
      } catch (err) {
        console.error('Error fetching profile data or parsing response:', err);
        // Use mock data for all states when any API call fails or returns invalid data
        setProfileData({
          user: currentUser,
          studentId: 'STU001',
          department: 'Computer Science',
          academicYear: '3rd Year',
          gpa: 3.75,
          creditsCompleted: 90,
          totalCreditsRequired: 180,
          phone: '+212 770472728',
          address: '123 University Ave, Campus City',
          bio: 'Computer Science student passionate about software development and AI.'
        });
        setAchievements([
          {
            id: 1,
            title: 'Dean\'s List',
            description: 'Achieved GPA above 3.5 for consecutive semesters',
            date: '2024-01-15',
            type: 'academic'
          },
          {
            id: 2,
            title: 'Programming Contest Winner',
            description: 'First place in university coding competition',
            date: '2023-11-20',
            type: 'competition'
          }
        ]);
        setProjects([
          {
            id: 1,
            title: 'Student Management System',
            description: 'Full-stack web application for managing student records',
            status: 'completed',
            grade: 'A+',
            submissionDate: '2024-01-10'
          },
          {
            id: 2,
            title: 'AI Chatbot',
            description: 'Natural language processing chatbot using machine learning',
            status: 'in-progress',
            grade: null,
            submissionDate: null
          }
        ]);
        setGrades([
          { course: 'Data Structures', grade: 'A', credits: 3, semester: 'Fall 2023' },
          { course: 'Algorithms', grade: 'A-', credits: 3, semester: 'Fall 2023' },
          { course: 'Database Systems', grade: 'B+', credits: 3, semester: 'Spring 2024' },
          { course: 'Web Development', grade: 'A', credits: 3, semester: 'Spring 2024' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && token) {
      fetchProfileData();
    }
  }, [currentUser, token]);
  
  // Calculate GPA from grades if not available in profile
  const calculateGPA = () => {
    if (profileData?.gpa) return profileData.gpa;
    if (grades.length === 0) return 0;
    
    const totalPoints = grades.reduce((sum, grade) => sum + (grade.gradeValue * grade.credits), 0);
    const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
    
    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Check if user is authenticated
  if (!currentUser || !token) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-8">
          <p>No profile data available</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const currentGPA = calculateGPA();
  const completedCredits = profileData.creditsCompleted || 0;
  const totalCredits = profileData.totalCreditsRequired || 180;
  const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

  // Academic stats
  const academicStats = [
    {
      title: 'Current GPA',
      value: currentGPA.toFixed(2),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Credits Completed',
      value: `${completedCredits}/${totalCredits}`,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Academic Year',
      value: profileData.academicYear || 'Not Set',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Progress',
      value: `${Math.round(progressPercentage)}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  // Get achievement icon based on type
  const getAchievementIcon = (type) => {
    switch (type) {
      case 'ACADEMIC': return Star;
      case 'RESEARCH': return FileText;
      case 'COMPETITION': return Award;
      case 'CERTIFICATION': return GraduationCap;
      default: return Award;
    }
  };
  
  // Get achievement color based on type
  const getAchievementColor = (type) => {
    switch (type) {
      case 'ACADEMIC': return 'text-yellow-600';
      case 'RESEARCH': return 'text-blue-600';
      case 'COMPETITION': return 'text-green-600';
      case 'CERTIFICATION': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };
  
  // Get project status badge variant
  const getProjectStatusVariant = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'ON_HOLD': return 'outline';
      default: return 'secondary';
    }
  };



  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">
              View and manage your academic profile and achievements.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard/student/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/student/settings">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                      {profileData.profilePicture ? (
                        <img 
                          src={profileData.profilePicture} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Name and Title */}
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold">
                      {profileData.user?.firstName || currentUser?.firstName} {profileData.user?.lastName || currentUser?.lastName}
                    </h2>
                    <p className="text-muted-foreground">
                      {profileData.department || 'Student'}
                    </p>
                    {profileData.studentId && (
                      <Badge variant="secondary">
                        {profileData.studentId}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {profileData.bio && (
                    <p className="text-sm text-muted-foreground text-center">
                      {profileData.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{profileData.user?.email || currentUser?.email}</p>
                  </div>
                </div>
                
                {profileData.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                    </div>
                  </div>
                )}
                
                {profileData.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{profileData.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Academic Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{profileData.department || 'Not Set'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Academic Year</p>
                    <p className="text-sm text-muted-foreground">{profileData.academicYear || 'Not Set'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Enrollment Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(profileData.enrollmentDate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Expected Graduation</p>
                    <p className="text-sm text-muted-foreground">{formatDate(profileData.expectedGraduation)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {academicStats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        {React.createElement(stat.icon, { className: `w-5 h-5 ${stat.color}` })}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Academic Progress</span>
                </CardTitle>
                <CardDescription>
                  Your progress towards graduation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Credits Completed</span>
                      <span className="text-sm text-muted-foreground">
                        {completedCredits} / {totalCredits}
                      </span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{currentGPA.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Current GPA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {totalCredits - completedCredits}
                      </p>
                      <p className="text-sm text-muted-foreground">Credits Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Current Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{project.title}</h3>
                          <Badge variant={getProjectStatusVariant(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progressPercentage || 0}%</span>
                          </div>
                          <Progress value={project.progressPercentage || 0} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Supervisor: {project.supervisor || 'Not Assigned'}</span>
                          <span>Due: {formatDate(project.endDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No active projects found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.length > 0 ? (
                    achievements.map((achievement, index) => {
                      const IconComponent = getAchievementIcon(achievement.type);
                      const iconColor = getAchievementColor(achievement.type);
                      
                      return (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className={`p-2 rounded-lg bg-muted`}>
                            <IconComponent className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(achievement.achievementDate)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                            {achievement.issuingOrganization && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Issued by: {achievement.issuingOrganization}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No achievements found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;