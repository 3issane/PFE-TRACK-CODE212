import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  Shield,
  GraduationCap,
  UserCheck,
  MoreHorizontal,
  Eye,
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data for demonstration
      setUsers([
        {
          id: 1,
          firstName: 'Ahmed',
          lastName: 'Benali',
          username: 'ahmed.benali',
          email: 'ahmed.benali@student.university.edu',
          roles: [{ name: 'ROLE_STUDENT' }],
          createdAt: '2024-01-15',
          lastLogin: '2024-03-15'
        },
        {
          id: 2,
          firstName: 'Fatima',
          lastName: 'Zahra',
          username: 'f.zahra',
          email: 'f.zahra@university.edu',
          roles: [{ name: 'ROLE_PROFESSOR' }],
          createdAt: '2023-09-01',
          lastLogin: '2024-03-14'
        },
        {
          id: 3,
          firstName: 'Sarah',
          lastName: 'Admin',
          username: 'admin',
          email: 'admin@university.edu',
          roles: [{ name: 'ROLE_ADMIN' }],
          createdAt: '2023-08-01',
          lastLogin: '2024-03-15'
        },
        {
          id: 4,
          firstName: 'Omar',
          lastName: 'Hassan',
          username: 'omar.hassan',
          email: 'omar.hassan@student.university.edu',
          roles: [{ name: 'ROLE_STUDENT' }],
          createdAt: '2024-02-01',
          lastLogin: '2024-03-13'
        },
        {
          id: 5,
          firstName: 'Youssef',
          lastName: 'Alami',
          username: 'y.alami',
          email: 'y.alami@university.edu',
          roles: [{ name: 'ROLE_PROFESSOR' }],
          createdAt: '2023-10-15',
          lastLogin: '2024-03-12'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.roles?.some(role => role.name === `ROLE_${roleFilter.toUpperCase()}`)
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleIcon = (roles) => {
    if (roles?.some(role => role.name === 'ROLE_ADMIN')) {
      return <Shield className="h-4 w-4 text-red-500" />;
    } else if (roles?.some(role => role.name === 'ROLE_PROFESSOR')) {
      return <UserCheck className="h-4 w-4 text-blue-500" />;
    } else {
      return <GraduationCap className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleBadge = (roles) => {
    if (roles?.some(role => role.name === 'ROLE_ADMIN')) {
      return <Badge variant="destructive">Admin</Badge>;
    } else if (roles?.some(role => role.name === 'ROLE_PROFESSOR')) {
      return <Badge variant="default">Professor</Badge>;
    } else {
      return <Badge variant="secondary">Student</Badge>;
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await api.post('/api/auth/signup', {
        ...newUser,
        roles: [newUser.role]
      });
      
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      setNewUser({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: 'student'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Username', 'Email', 'Role', 'Created At', 'Last Login'],
      ...filteredUsers.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.username,
        user.email,
        user.roles?.[0]?.name?.replace('ROLE_', '') || 'Unknown',
        user.createdAt,
        user.lastLogin
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all system users, roles, and permissions.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system with appropriate role and permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="professor">Professors</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({filteredUsers.length})</span>
              <Badge variant="outline">{users.length} total users</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-left p-4 font-medium">Last Login</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.roles)}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.roles)}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;