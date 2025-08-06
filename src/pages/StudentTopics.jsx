import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar, 
  MapPin,
  Heart,
  HeartOff,
  Star,
  Clock,
  Users,
  Brain,
  Cpu,
  Database,
  Globe,
  Smartphone,
  // Add other icons as needed
} from 'lucide-react';

// Mapping of icon names (strings) to their actual Lucide React components
const iconMap = {
  Brain: Brain,
  Cpu: Cpu,
  Database: Database,
  Globe: Globe,
  Smartphone: Smartphone,
  // Add other mappings for icons used in your API data
};
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import DashboardLayout from '../components/layout/DashboardLayout';
import { topicsAPI } from '../services/api';

const StudentTopics = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mockTopics = [
    {
      id: 1,
      title: "AI-Based Medical Diagnosis System",
      description: "Develop a machine learning system for automated medical image analysis and diagnosis assistance.",
      supervisor: "Dr. Ahmed Khouani",
      department: "Computer Science",
      type: "PFE",
      difficulty: "Advanced",
      duration: "6 months",
      skills: ["Machine Learning", "Python", "TensorFlow", "Medical Imaging"],
      icon: Brain,
      color: "bg-purple-100 text-purple-600",
      availability: "Available",
      prerequisites: "Strong background in ML, Python programming, Statistics",
      maxStudents: 2,
      currentStudents: 0,
      rating: 4.8,
      totalRatings: 15
    },
    {
      id: 2,
      title: "IoT Smart Campus Management",
      description: "Design and implement an IoT system for smart campus monitoring including energy, security, and resource management.",
      supervisor: "Prof. Sarah Johnson",
      department: "Electrical Engineering",
      type: "PFE",
      difficulty: "Intermediate",
      duration: "6 months",
      skills: ["IoT", "Arduino", "Raspberry Pi", "Node.js", "React"],
      icon: Cpu,
      color: "bg-blue-100 text-blue-600",
      availability: "Available",
      prerequisites: "Basic electronics, programming fundamentals",
      maxStudents: 3,
      currentStudents: 1,
      rating: 4.6,
      totalRatings: 12
    },
    {
      id: 3,
      title: "Blockchain-Based Supply Chain",
      description: "Create a transparent supply chain management system using blockchain technology for product traceability.",
      supervisor: "Dr. Mohamed Alami",
      department: "Computer Science", 
      type: "PFE",
      difficulty: "Advanced",
      duration: "6 months",
      skills: ["Blockchain", "Solidity", "Web3", "React", "Node.js"],
      icon: Database,
      color: "bg-green-100 text-green-600",
      availability: "Limited",
      prerequisites: "Blockchain fundamentals, JavaScript, cryptography basics",
      maxStudents: 2,
      currentStudents: 1,
      rating: 4.9,
      totalRatings: 8
    },
    {
      id: 4,
      title: "E-Learning Platform with VR",
      description: "Develop an immersive virtual reality e-learning platform for enhanced educational experiences.",
      supervisor: "Dr. Fatima Zahra",
      department: "Computer Science",
      type: "PFE",
      difficulty: "Advanced",
      duration: "6 months",
      skills: ["Unity", "C#", "VR Development", "3D Modeling", "UI/UX"],
      icon: Globe,
      color: "bg-orange-100 text-orange-600",
      availability: "Available",
      prerequisites: "Unity experience, C# programming, 3D graphics knowledge",
      maxStudents: 2,
      currentStudents: 0,
      rating: 4.7,
      totalRatings: 10
    },
    {
      id: 5,
      title: "Mobile Health Monitoring App",
      description: "Build a comprehensive mobile application for personal health tracking with wearable device integration.",
      supervisor: "Prof. Youssef Benali",
      department: "Computer Science",
      type: "PFE",
      difficulty: "Intermediate",
      duration: "5 months",
      skills: ["React Native", "Firebase", "Health APIs", "Mobile Dev"],
      icon: Smartphone,
      color: "bg-pink-100 text-pink-600",
      availability: "Available",
      prerequisites: "Mobile development experience, API integration knowledge",
      maxStudents: 2,
      currentStudents: 0,
      rating: 4.5,
      totalRatings: 18
    },
    {
      id: 6,
      title: "Cybersecurity Threat Detection",
      description: "Implement an advanced threat detection system using AI for network security monitoring.",
      supervisor: "Dr. Karim Hassan",
      department: "Computer Science",
      type: "PFE", 
      difficulty: "Advanced",
      duration: "6 months",
      skills: ["Cybersecurity", "Machine Learning", "Network Security", "Python"],
      icon: Database,
      color: "bg-red-100 text-red-600",
      availability: "Full",
      prerequisites: "Cybersecurity fundamentals, ML basics, networking knowledge",
      maxStudents: 1,
      currentStudents: 1,
      rating: 4.8,
      totalRatings: 6
    }
  ];

  useEffect(() => {
    const fetchTopics = async () => {
      if (!currentUser) {
        setError('Please log in to view topics.');
        setLoading(false);
        const mappedMockTopics = mockTopics.map(topic => ({
          ...topic,
          icon: iconMap[topic.icon] || Brain
        }));
        setTopics(mappedMockTopics);
        return;
      }
      try {
        setLoading(true);
        console.log('Fetching topics from API...');
        const data = await topicsAPI.getAll();
        console.log('Topics fetched successfully:', data);
        const mappedTopics = data.map(topic => ({
          ...topic,
          icon: iconMap[topic.icon] || Brain // Default to Brain if icon not found
        }));
        setTopics(mappedTopics);
      } catch (err) {
        setError('Failed to load topics - using offline data');
        console.error('Error fetching topics:', err);
        console.log('Falling back to mock data');
        
        // Set mock data when API fails
        const mappedMockTopics = mockTopics.map(topic => ({
          ...topic,
          icon: iconMap[topic.icon] || Brain
        }));
        setTopics(mappedMockTopics);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Use API data if available, otherwise fall back to mock data
  const displayTopics = topics.length > 0 ? topics : mockTopics;

  const departments = [
    "all",
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
  ];

  const filteredTopics = displayTopics.filter(topic => {
    const matchesSearch = (topic.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.supervisor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === "all" || topic.department === selectedDepartment;
    const matchesType = selectedType === "all" || topic.type === selectedType;
    
    return matchesSearch && matchesDepartment && matchesType;
  });

  const toggleFavorite = (topicId) => {
    setFavorites(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleApply = async (topicId) => {
    try {
      await topicsAPI.apply(topicId);
      alert("Application submitted successfully!");
    } catch (err) {
      alert("Failed to submit application. Please try again.");
      console.error('Error applying to topic:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Limited":
        return "bg-yellow-100 text-yellow-800";
      case "Full":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">PFE Topics</h1>
          <p className="text-muted-foreground">
            Browse and apply for available PFE topics from various departments.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Topics</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title, supervisor, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PFE">PFE</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("all");
                  setSelectedType("all");
                }}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading topics...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">Error: {error}</p>
              <p className="text-red-500 text-sm mt-1">Check the browser console for more details.</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {filteredTopics.length} of {displayTopics.length} topics
              </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          {/* Topics Grid */}
          {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${topic.color}`}>
                        {React.createElement(topic.icon, { className: "w-5 h-5" })}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {topic.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(topic.id)}
                      className="shrink-0"
                    >
                      {favorites.includes(topic.id) ? (
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      ) : (
                        <HeartOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Supervisor & Department */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{topic.supervisor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{topic.department}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(topic.difficulty)}>
                      {topic.difficulty}
                    </Badge>
                    <Badge className={getAvailabilityColor(topic.availability)}>
                      {topic.availability}
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{topic.duration}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{topic.currentStudents}/{topic.maxStudents}</span>
                    </Badge>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {(topic.skills || []).slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(topic.skills || []).length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(topic.skills || []).length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{topic.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({topic.totalRatings} reviews)
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedTopic(topic)}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        {selectedTopic && (
                          <>
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <div className={`p-2 rounded-lg ${selectedTopic.color}`}>
                  {selectedTopic.icon && React.createElement(selectedTopic.icon, { className: "w-5 h-5" })}
                </div>
                                <span>{selectedTopic.title}</span>
                              </DialogTitle>
                              <DialogDescription>
                                {selectedTopic.description}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium">Supervisor</p>
                                  <p className="text-muted-foreground">{selectedTopic.supervisor}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Department</p>
                                  <p className="text-muted-foreground">{selectedTopic.department}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Duration</p>
                                  <p className="text-muted-foreground">{selectedTopic.duration}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Students</p>
                                  <p className="text-muted-foreground">
                                    {selectedTopic.currentStudents}/{selectedTopic.maxStudents}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="font-medium mb-2">Prerequisites</p>
                                <p className="text-muted-foreground">{selectedTopic.prerequisites}</p>
                              </div>

                              <div>
                                <p className="font-medium mb-2">Required Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {(selectedTopic.skills || []).map((skill, index) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="motivation">Why are you interested in this topic?</Label>
                                <Textarea 
                                  id="motivation"
                                  placeholder="Explain your motivation and relevant experience..."
                                  rows={4}
                                />
                              </div>

                              <div className="flex space-x-2">
                                <Button 
                                  className="flex-1"
                                  onClick={() => handleApply(selectedTopic.id)}
                                  disabled={selectedTopic.availability === "Full"}
                                >
                                  Apply for This Topic
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => toggleFavorite(selectedTopic.id)}
                                >
                                  {favorites.includes(selectedTopic.id) ? (
                                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                  ) : (
                                    <HeartOff className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      onClick={() => handleApply(topic.id)}
                      disabled={topic.availability === "Full"}
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No topics found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentTopics;