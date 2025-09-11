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
  Shield,
  Award,
  Target,
  TrendingUp,
  Edit,
  Settings,
  Users,
  Clock,
  Star,
  FileText,
  Database,
  MessageSquare,
  Loader2,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';

const AdminProfile = () => {
  const { currentUser, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [systemStats, setSystemStats] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin profile with fallback to mock data
        try {
          const profileResponse = await api.get('/admin/profile');
          setProfileData(profileResponse.data);
        } catch (profileError) {
          console.warn('Admin profile API failed. Using mock data.');
          setProfileData({
            user: currentUser,
            adminId: 'ADM001',
            department: 'Administration',
            role: 'System Administrator',
            joinDate: '2023-01-15',
            phone: '+212 661234567',
            address: 'ENSA Marrakech, Administrative Building',
            bio: 'System administrator responsible for managing the PFE tracking platform.',
            permissions: ['USER_MANAGEMENT', 'PROJECT_MANAGEMENT', 'SYSTEM_CONFIG', 'REPORTS']
          });
        }
        
        // Fetch system statistics
        try {
          const statsResponse = await api.get('/admin/system-stats');
          setSystemStats(statsResponse.data);
        } catch (statsError) {
          console.warn('System stats API failed. Using mock data.');
          setSystemStats([
            { label: 'Total Users Managed', value: 3, icon: Users, color: 'blue' },
            { label: 'Projects Supervised', value: 5, icon: FileText, color: 'green' },
            { label: 'System Uptime', value: '99.9%', icon: Database, color: 'purple' },
            { label: 'Reports Generated', value: 5, icon: BarChart3, color: 'orange' }
          ]);
        }
        
        // Fetch recent admin actions
        try {
          const actionsResponse = await api.get('/admin/recent-actions');
          setRecentActions(actionsResponse.data);
        } catch (actionsError) {
          console.warn('Recent actions API failed. Using mock data.');
          setRecentActions([
            {
              id: 1,
              action: 'Created new user account',
              target: 'aissane@ensa.ma',
              timestamp: '2024-01-15T10:30:00Z',
              type: 'user_creation'
            },
            {
              id: 2,
              action: 'Approved project proposal',
              target: 'AI-Based Learning Platform',
              timestamp: '2024-01-15T09:15:00Z',
              type: 'project_approval'
            },
            {
              id: 3,
              action: 'Updated system configuration',
              target: 'Email notifications',
              timestamp: '2024-01-14T16:45:00Z',
              type: 'system_config'
            }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAdminData();
    }
  }, [currentUser, token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'user_creation': return UserCheck;
      case 'project_approval': return FileText;
      case 'system_config': return Settings;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement du profil...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil Administrateur</h1>
            <p className="text-gray-600 mt-1">Gérez vos informations personnelles et consultez vos statistiques</p>
          </div>
          <Link to="/dashboard/admin/settings">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </h3>
                    <p className="text-gray-600">{profileData?.role}</p>
                    <Badge variant="secondary" className="mt-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrateur
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{profileData?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="font-medium">{profileData?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date d'embauche</p>
                      <p className="font-medium">{formatDate(profileData?.joinDate)}</p>
                    </div>
                  </div>
                </div>
                
                {profileData?.bio && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Biographie</p>
                    <p className="text-gray-700">{profileData.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissions et Accès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {profileData?.permissions?.map((permission, index) => (
                    <Badge key={index} variant="outline" className="justify-center py-2">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Actions Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActions.map((action) => {
                    const IconComponent = getActionIcon(action.type);
                    return (
                      <div key={action.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{action.action}</p>
                          <p className="text-sm text-gray-600">{action.target}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(action.timestamp)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 text-${stat.color}-500`} />
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="font-bold text-lg">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/dashboard/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les Utilisateurs
                  </Button>
                </Link>
                <Link to="/dashboard/admin/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Gérer les Projets
                  </Button>
                </Link>
                <Link to="/dashboard/admin/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Voir les Analyses
                  </Button>
                </Link>
                <Link to="/dashboard/admin/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres Système
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;