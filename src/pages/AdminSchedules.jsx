import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Calendar, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  User,
  BookOpen,
  MoreHorizontal,
  Download,
  Upload,
  CalendarDays,
  Users,
  GraduationCap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminSchedules = () => {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    type: 'LECTURE',
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    location: '',
    instructor: '',
    capacity: '',
    enrolled: 0
  });

  // Mock data for demonstration
  const mockSchedules = [
    {
      id: 1,
      title: 'Advanced Web Development',
      description: 'Full-stack web development with React and Node.js',
      type: 'LECTURE',
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Room A101',
      instructor: {
        id: 1,
        name: 'Prof. Johnson',
        email: 'prof.johnson@example.com'
      },
      capacity: 30,
      enrolled: 28,
      semester: 'Spring 2024',
      course: 'CS-401'
    },
    {
      id: 2,
      title: 'Database Systems Lab',
      description: 'Hands-on database design and implementation',
      type: 'LAB',
      dayOfWeek: 'WEDNESDAY',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Lab B205',
      instructor: {
        id: 2,
        name: 'Dr. Smith',
        email: 'dr.smith@example.com'
      },
      capacity: 20,
      enrolled: 18,
      semester: 'Spring 2024',
      course: 'CS-302'
    },
    {
      id: 3,
      title: 'Software Engineering Seminar',
      description: 'Industry best practices and methodologies',
      type: 'SEMINAR',
      dayOfWeek: 'FRIDAY',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Auditorium C',
      instructor: {
        id: 3,
        name: 'Prof. Davis',
        email: 'prof.davis@example.com'
      },
      capacity: 100,
      enrolled: 85,
      semester: 'Spring 2024',
      course: 'CS-450'
    },
    {
      id: 4,
      title: 'Machine Learning Workshop',
      description: 'Practical ML algorithms and applications',
      type: 'WORKSHOP',
      dayOfWeek: 'TUESDAY',
      startTime: '13:00',
      endTime: '15:00',
      location: 'Room D301',
      instructor: {
        id: 4,
        name: 'Dr. Wilson',
        email: 'dr.wilson@example.com'
      },
      capacity: 25,
      enrolled: 22,
      semester: 'Spring 2024',
      course: 'CS-480'
    },
    {
      id: 5,
      title: 'Project Presentation',
      description: 'Final project presentations for senior students',
      type: 'PRESENTATION',
      dayOfWeek: 'THURSDAY',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Conference Room',
      instructor: {
        id: 5,
        name: 'Prof. Brown',
        email: 'prof.brown@example.com'
      },
      capacity: 50,
      enrolled: 45,
      semester: 'Spring 2024',
      course: 'CS-499'
    }
  ];

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const scheduleTypes = ['LECTURE', 'LAB', 'SEMINAR', 'WORKSHOP', 'PRESENTATION', 'EXAM'];

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, typeFilter, dayFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // const response = await api.get('/api/schedules');
      // setSchedules(response.data);
      
      // Using mock data for demonstration
      setTimeout(() => {
        setSchedules(mockSchedules);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules(mockSchedules);
      setLoading(false);
    }
  };

  const filterSchedules = () => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.type === typeFilter);
    }

    if (dayFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.dayOfWeek === dayFilter);
    }

    setFilteredSchedules(filtered);
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'LECTURE': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'LAB': { variant: 'secondary', color: 'bg-green-100 text-green-800' },
      'SEMINAR': { variant: 'outline', color: 'bg-purple-100 text-purple-800' },
      'WORKSHOP': { variant: 'secondary', color: 'bg-orange-100 text-orange-800' },
      'PRESENTATION': { variant: 'outline', color: 'bg-pink-100 text-pink-800' },
      'EXAM': { variant: 'destructive', color: 'bg-red-100 text-red-800' }
    };

    const config = typeConfig[type] || typeConfig['LECTURE'];

    return (
      <Badge className={config.color}>
        {type}
      </Badge>
    );
  };

  const getEnrollmentStatus = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Full' };
    if (percentage >= 75) return { color: 'text-yellow-600', status: 'High' };
    return { color: 'text-green-600', status: 'Available' };
  };

  const handleCreateSchedule = async () => {
    try {
      // const response = await api.post('/api/schedules', newSchedule);
      // setSchedules([...schedules, response.data]);
      
      // Mock creation
      const mockNewSchedule = {
        id: schedules.length + 1,
        ...newSchedule,
        instructor: {
          id: 999,
          name: newSchedule.instructor,
          email: `${newSchedule.instructor.toLowerCase().replace(' ', '.')}@example.com`
        },
        enrolled: 0,
        semester: 'Spring 2024',
        course: 'NEW-001'
      };
      
      setSchedules([...schedules, mockNewSchedule]);
      setShowCreateDialog(false);
      setNewSchedule({
        title: '',
        description: '',
        type: 'LECTURE',
        dayOfWeek: 'MONDAY',
        startTime: '',
        endTime: '',
        location: '',
        instructor: '',
        capacity: '',
        enrolled: 0
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      // await api.delete(`/api/schedules/${scheduleId}`);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      setShowDeleteDialog(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const exportSchedules = () => {
    const exportData = filteredSchedules.map(schedule => ({
      title: schedule.title,
      type: schedule.type,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      instructor: schedule.instructor.name,
      capacity: schedule.capacity,
      enrolled: schedule.enrolled
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedules-export.json';
    a.click();
    window.URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold text-gray-900">Academic Schedules</h1>
            <p className="text-gray-600 mt-1">
              Manage class schedules, labs, and academic events.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportSchedules}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Schedule</DialogTitle>
                  <DialogDescription>
                    Add a new class or event to the schedule.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newSchedule.title}
                      onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select value={newSchedule.type} onValueChange={(value) => setNewSchedule({...newSchedule, type: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dayOfWeek" className="text-right">
                      Day
                    </Label>
                    <Select value={newSchedule.dayOfWeek} onValueChange={(value) => setNewSchedule({...newSchedule, dayOfWeek: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={newSchedule.location}
                      onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="instructor" className="text-right">
                      Instructor
                    </Label>
                    <Input
                      id="instructor"
                      value={newSchedule.instructor}
                      onChange={(e) => setNewSchedule({...newSchedule, instructor: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newSchedule.capacity}
                      onChange={(e) => setNewSchedule({...newSchedule, capacity: parseInt(e.target.value) || 0})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateSchedule}>
                    Create Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules.reduce((sum, schedule) => sum + schedule.capacity, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules.reduce((sum, schedule) => sum + schedule.enrolled, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (schedules.reduce((sum, schedule) => sum + schedule.enrolled, 0) /
                   schedules.reduce((sum, schedule) => sum + schedule.capacity, 0)) * 100
                )}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {scheduleTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {daysOfWeek.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => {
            const enrollmentStatus = getEnrollmentStatus(schedule.enrolled, schedule.capacity);
            
            return (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{schedule.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeBadge(schedule.type)}
                        <Badge variant="outline" className={enrollmentStatus.color}>
                          {enrollmentStatus.status}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowEditDialog(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {schedule.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{schedule.dayOfWeek}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{schedule.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{schedule.instructor.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Enrollment:</span>
                      <span className={`font-medium ${enrollmentStatus.color}`}>
                        {schedule.enrolled}/{schedule.capacity}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(schedule.enrolled / schedule.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== 'all' || dayFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first schedule to get started.'}
            </p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Schedule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedSchedule?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteSchedule(selectedSchedule?.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminSchedules;