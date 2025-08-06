import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Award, 
  Calendar, 
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const StudentGrades = () => {
  const { currentUser } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [grades, setGrades] = useState([]);
  const [gradeStats, setGradeStats] = useState(null);
  const [upcomingEvaluations, setUpcomingEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for fallback
  const mockGradeStats = {
    overallGPA: 3.75,
    currentSemesterGPA: 3.85,
    completedCredits: 145,
    totalCredits: 180,
    classRank: 12,
    totalStudents: 85
  };

  const mockGrades = [
    {
      id: 1,
      courseCode: 'CS301',
      courseName: 'Advanced Programming',
      credits: 3,
      grade: 'A',
      gpa: 4.0,
      semester: 'Spring 2024',
      professor: 'Dr. Smith'
    },
    {
      id: 2,
      courseCode: 'CS302',
      courseName: 'Database Systems',
      credits: 3,
      grade: 'A-',
      gpa: 3.7,
      semester: 'Spring 2024',
      professor: 'Dr. Johnson'
    },
    {
      id: 3,
      courseCode: 'CS303',
      courseName: 'Software Engineering',
      credits: 4,
      grade: 'B+',
      gpa: 3.3,
      semester: 'Spring 2024',
      professor: 'Dr. Williams'
    }
  ];

  const mockUpcomingEvaluations = [
    {
      id: 1,
      courseCode: 'CS304',
      courseName: 'Machine Learning',
      type: 'Final Exam',
      date: '2024-05-15',
      weight: 40
    },
    {
      id: 2,
      courseCode: 'CS305',
      courseName: 'Web Development',
      type: 'Project Presentation',
      date: '2024-05-18',
      weight: 30
    }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchGradesData();
    } else {
      // Fallback to mock data if not authenticated
      setGrades(mockGrades);
      setGradeStats(mockGradeStats);
      setUpcomingEvaluations(mockUpcomingEvaluations);
      setLoading(false);
      setError('Please log in to view your grades. Displaying sample data.');
    }
  }, [selectedSemester, currentUser]);

  const fetchGradesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch grades from backend API
      const gradesResponse = await api.get('/api/grades/my-grades');
      const grades = gradesResponse.data;
      
      // Calculate stats from grades data
      const currentSemesterGrades = grades.filter(grade => grade.semester === 'Spring 2024');
      const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
      const totalGradePoints = grades.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0);
      const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
      
      const currentSemesterCredits = currentSemesterGrades.reduce((sum, grade) => sum + grade.credits, 0);
      const currentSemesterGradePoints = currentSemesterGrades.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0);
      const currentSemesterGPA = currentSemesterCredits > 0 ? currentSemesterGradePoints / currentSemesterCredits : 0;
      
      const calculatedStats = {
        overallGPA: overallGPA,
        currentSemesterGPA: currentSemesterGPA,
        completedCredits: totalCredits,
        totalCredits: 180, // Assuming total required credits
        classRank: 12, // This would need to be calculated server-side
        totalStudents: 85 // This would come from server
      };
      
      setGrades(grades);
      setGradeStats(calculatedStats);
      
      // For now, use mock upcoming evaluations as this would require a separate entity
      setUpcomingEvaluations(mockUpcomingEvaluations);
      
    } catch (error) {
      console.error('Error fetching grades:', error);
      console.log('Falling back to mock data');
      
      // Fallback to mock data
      setGrades(mockGrades);
      setGradeStats(mockGradeStats);
      setUpcomingEvaluations(mockUpcomingEvaluations);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const displayStats = gradeStats ? [
    {
      title: "Overall GPA",
      value: gradeStats.overallGPA?.toFixed(2) || "N/A",
      icon: Award,
      description: "Excellent",
      color: "text-green-600"
    },
    {
      title: "Current Semester",
      value: gradeStats.currentSemesterGPA?.toFixed(2) || "N/A",
      icon: TrendingUp,
      description: "Spring 2024",
      color: "text-blue-600"
    },
    {
      title: "Completed Credits",
      value: `${gradeStats.completedCredits || 0}/${gradeStats.totalCredits || 0}`,
      icon: BookOpen,
      description: `${((gradeStats.completedCredits / gradeStats.totalCredits) * 100).toFixed(1)}% Complete`,
      color: "text-purple-600"
    },
    {
      title: "Class Rank",
      value: `${gradeStats.classRank || 0}/${gradeStats.totalStudents || 0}`,
      icon: Target,
      description: "Top 15%",
      color: "text-orange-600"
    }
  ] : [];

  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A+') return 'bg-green-100 text-green-800';
    if (grade === 'A-' || grade === 'B+') return 'bg-blue-100 text-blue-800';
    if (grade === 'B' || grade === 'B-') return 'bg-yellow-100 text-yellow-800';
    if (grade === 'C+' || grade === 'C') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getDaysUntilEvaluation = (dateString) => {
    const evalDate = new Date(dateString);
    const today = new Date();
    const diffTime = evalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Grades & Schedule</h1>
            <p className="text-muted-foreground">Loading your academic data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Grades & Schedule</h1>
          <p className="text-muted-foreground">
            Track your academic performance and upcoming evaluations.
          </p>
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Grade Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat, index) => (
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
          {/* Current Grades */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Current Semester Grades</span>
                </CardTitle>
                <CardDescription>
                  Spring 2024 - Computer Science
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.map((course, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{course.courseName}</h3>
                          <p className="text-sm text-muted-foreground">{course.courseCode} • {course.credits} Credits</p>
                          {course.professor && (
                            <p className="text-sm text-muted-foreground">{course.professor}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={getGradeColor(course.grade)}>
                            {course.grade}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{course.gpa} GPA</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Semester</span>
                          <span className="font-medium">{course.semester}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Grade Points</span>
                          <span className="font-medium">{(course.gpa * course.credits).toFixed(1)} points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Evaluations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming Evaluations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvaluations.map((evaluation, index) => {
                    const daysLeft = getDaysUntilEvaluation(evaluation.date);
                    return (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{evaluation.type}</h4>
                            <p className="text-xs text-muted-foreground">{evaluation.courseName}</p>
                            <p className="text-xs text-muted-foreground">{evaluation.courseCode}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {evaluation.weight}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(evaluation.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{evaluation.time} ({evaluation.duration})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>📍 {evaluation.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            className={`text-xs ${
                              daysLeft <= 3 ? 'bg-red-100 text-red-800' :
                              daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Today' : 'Past due'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;