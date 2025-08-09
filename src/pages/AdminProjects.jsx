import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  BookOpen, 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  Upload
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

const AdminProjects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    dueDate: '',
    assignedTo: ''
  });

  // Mock data for demonstration
  const mockProjects = [
    {
      id: 1,
      title: 'E-Commerce Platform Development',
      description: 'Full-stack web application for online shopping with payment integration',
      status: 'IN_PROGRESS',
      dueDate: '2024-03-15',
      createdAt: '2024-01-10',
      assignedTo: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      supervisor: {
        id: 2,
        name: 'Prof. Smith',
        email: 'prof.smith@example.com'
      },
      progress: 65,
      milestones: 8,
      completedMilestones: 5
    },
    {
      id: 2,
      title: 'Mobile App for Task Management',
      description: 'Cross-platform mobile application for productivity and task tracking',
      status: 'COMPLETED',
      dueDate: '2024-02-20',
      createdAt: '2023-11-15',
      assignedTo: {
        id: 3,
        name: 'Jane Smith',
        email: 'jane.smith@example.com'
      },
      supervisor: {
        id: 4,
        name: 'Prof. Johnson',
        email: 'prof.johnson@example.com'
      },
      progress: 100,
      milestones: 6,
      completedMilestones: 6
    },
    {
      id: 3,
      title: 'AI-Powered Chatbot',
      description: 'Intelligent chatbot using natural language processing for customer support',
      status: 'PENDING',
      dueDate: '2024-04-30',
      createdAt: '2024-02-01',
      assignedTo: {
        id: 5,
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com'
      },
      supervisor: {
        id: 6,
        name: 'Prof. Davis',
        email: 'prof.davis@example.com'
      },
      progress: 15,
      milestones: 10,
      completedMilestones: 1
    },
    {
      id: 4,
      title: 'Data Analytics Dashboard',
      description: 'Business intelligence dashboard with real-time data visualization',
      status: 'OVERDUE',
      dueDate: '2024-01-30',
      createdAt: '2023-10-15',
      assignedTo: {
        id: 7,
        name: 'Sarah Brown',
        email: 'sarah.brown@example.com'
      },
      supervisor: {
        id: 8,
        name: 'Prof. Miller',
        email: 'prof.miller@example.com'
      },
      progress: 80,
      milestones: 7,
      completedMilestones: 5
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // const response = await api.get('/api/projects');
      // setProjects(response.data);
      
      // Using mock data for demonstration
      setTimeout(() => {
        setProjects(mockProjects);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(mockProjects);
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      'IN_PROGRESS': { variant: 'default', icon: Target, color: 'text-blue-600' },
      'COMPLETED': { variant: 'success', icon: CheckCircle, color: 'text-green-600' },
      'OVERDUE': { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleCreateProject = async () => {
    try {
      // const response = await api.post('/api/projects', newProject);
      // setProjects([...projects, response.data]);
      
      // Mock creation
      const mockNewProject = {
        id: projects.length + 1,
        ...newProject,
        createdAt: new Date().toISOString().split('T')[0],
        assignedTo: {
          id: 999,
          name: newProject.assignedTo,
          email: `${newProject.assignedTo.toLowerCase().replace(' ', '.')}@example.com`
        },
        supervisor: {
          id: 999,
          name: 'Prof. Admin',
          email: 'prof.admin@example.com'
        },
        progress: 0,
        milestones: 5,
        completedMilestones: 0
      };
      
      setProjects([...projects, mockNewProject]);
      setShowCreateDialog(false);
      setNewProject({
        title: '',
        description: '',
        status: 'PENDING',
        dueDate: '',
        assignedTo: ''
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      // await api.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteDialog(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const exportProjects = () => {
    const exportData = filteredProjects.map(project => ({
      title: project.title,
      description: project.description,
      status: project.status,
      dueDate: project.dueDate,
      assignedTo: project.assignedTo.name,
      supervisor: project.supervisor.name,
      progress: project.progress
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects-export.json';
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
            <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all projects across the system.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportProjects}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newProject.dueDate}
                      onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">
                      Assigned To
                    </Label>
                    <Input
                      id="assignedTo"
                      value={newProject.assignedTo}
                      onChange={(e) => setNewProject({...newProject, assignedTo: e.target.value})}
                      placeholder="Student name"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateProject}>
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusBadge(project.status)}
                      <Badge variant="outline" className="text-xs">
                        {project.progress}% Complete
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedProject(project);
                        setShowEditDialog(true);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedProject(project);
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
                  {project.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{project.assignedTo.name}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Milestones: {project.completedMilestones}/{project.milestones}</span>
                    <span>{project.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first project to get started.'}
            </p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteProject(selectedProject?.id)}
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

export default AdminProjects;