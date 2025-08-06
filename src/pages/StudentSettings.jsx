import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Bell, 
  Shield,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
  Camera,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Calendar,
  BookOpen
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

const StudentSettings = () => {
  const { currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    bio: '',
    studentId: 'STU-2024-001',
    department: 'Computer Science',
    year: '4th Year'
  });

  // Settings state - will be populated from backend
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    gradeNotifications: true,
    deadlineReminders: true,
    meetingReminders: true,
    announcementNotifications: true,
    
    // Privacy settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,
    
    // Appearance settings
    theme: 'system',
    language: 'en',
    fontSize: 'medium',
    compactMode: false,
    animationsEnabled: true,
    
    // Academic settings
    defaultCalendarView: 'month',
    gradeDisplayFormat: 'percentage',
    autoSaveReports: true,
    reminderAdvanceDays: 3,
    
    // Dashboard settings
    dashboardLayout: 'default',
    showRecentActivities: true,
    showUpcomingDeadlines: true,
    showGradeSummary: true
  });

  useEffect(() => {
    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/student-settings/my-settings');
      const fetchedSettings = response.data || {};
      
      setSettings({
        // Notification settings
        emailNotifications: fetchedSettings.emailNotifications ?? true,
        pushNotifications: fetchedSettings.pushNotifications ?? true,
        gradeNotifications: fetchedSettings.gradeNotifications ?? true,
        deadlineReminders: fetchedSettings.deadlineReminders ?? true,
        meetingReminders: fetchedSettings.meetingReminders ?? true,
        announcementNotifications: fetchedSettings.announcementNotifications ?? true,
        
        // Privacy settings
        profileVisibility: fetchedSettings.profileVisibility || 'public',
        showEmail: fetchedSettings.showEmail ?? false,
        showPhone: fetchedSettings.showPhone ?? false,
        allowMessages: fetchedSettings.allowMessages ?? true,
        showOnlineStatus: fetchedSettings.showOnlineStatus ?? true,
        
        // Appearance settings
        theme: fetchedSettings.theme || 'system',
        language: fetchedSettings.language || 'en',
        fontSize: fetchedSettings.fontSize || 'medium',
        compactMode: fetchedSettings.compactMode ?? false,
        animationsEnabled: fetchedSettings.animationsEnabled ?? true,
        
        // Academic settings
        defaultCalendarView: fetchedSettings.defaultCalendarView || 'month',
        gradeDisplayFormat: fetchedSettings.gradeDisplayFormat || 'percentage',
        autoSaveReports: fetchedSettings.autoSaveReports ?? true,
        reminderAdvanceDays: fetchedSettings.reminderAdvanceDays || 3,
        
        // Dashboard settings
        dashboardLayout: fetchedSettings.dashboardLayout || 'default',
        showRecentActivities: fetchedSettings.showRecentActivities ?? true,
        showUpcomingDeadlines: fetchedSettings.showUpcomingDeadlines ?? true,
        showGradeSummary: fetchedSettings.showGradeSummary ?? true
      });
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsUpdate = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Map frontend settings to backend format
      const settingsToSave = {
        // Notification settings
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        gradeNotifications: settings.gradeNotifications,
        deadlineReminders: settings.deadlineReminders,
        meetingReminders: settings.meetingReminders,
        announcementNotifications: settings.announcementNotifications,
        
        // Privacy settings
        profileVisibility: settings.profileVisibility,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        allowMessages: settings.allowMessages,
        showOnlineStatus: settings.showOnlineStatus,
        
        // Appearance settings
        theme: settings.theme,
        language: settings.language,
        fontSize: settings.fontSize,
        compactMode: settings.compactMode,
        animationsEnabled: settings.animationsEnabled,
        
        // Academic settings
        defaultCalendarView: settings.defaultCalendarView,
        gradeDisplayFormat: settings.gradeDisplayFormat,
        autoSaveReports: settings.autoSaveReports,
        reminderAdvanceDays: settings.reminderAdvanceDays,
        
        // Dashboard settings
        dashboardLayout: settings.dashboardLayout,
        showRecentActivities: settings.showRecentActivities,
        showUpcomingDeadlines: settings.showUpcomingDeadlines,
        showGradeSummary: settings.showGradeSummary
      };
      
      await api.put('/api/student-settings/my-settings', settingsToSave);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await api.put('/api/student-settings/my-settings/reset');
      
      // Refresh settings after reset
      await fetchSettings();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'dashboard', label: 'Dashboard', icon: Settings }
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change Picture
              </Button>
              <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleProfileUpdate('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={profileData.studentId}
                disabled
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profileData.address}
              onChange={(e) => handleProfileUpdate('address', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={profileData.bio}
              onChange={(e) => handleProfileUpdate('bio', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>Your academic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileData.department}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Input
                id="year"
                value={profileData.year}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingsUpdate('pushNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Grade Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified when grades are posted</p>
            </div>
            <Switch
              checked={settings.gradeNotifications}
              onCheckedChange={(checked) => handleSettingsUpdate('gradeNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Deadline Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders for upcoming deadlines</p>
            </div>
            <Switch
              checked={settings.deadlineReminders}
              onCheckedChange={(checked) => handleSettingsUpdate('deadlineReminders', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meeting Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders for scheduled meetings</p>
            </div>
            <Switch
              checked={settings.meetingReminders}
              onCheckedChange={(checked) => handleSettingsUpdate('meetingReminders', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Announcement Notifications</Label>
              <p className="text-sm text-muted-foreground">System announcements and updates</p>
            </div>
            <Switch
              checked={settings.announcementNotifications}
              onCheckedChange={(checked) => handleSettingsUpdate('announcementNotifications', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>Control your privacy and visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingsUpdate('profileVisibility', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="students">Students Only</SelectItem>
                <SelectItem value="department">Department Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email Address</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your email</p>
            </div>
            <Switch
              checked={settings.showEmail}
              onCheckedChange={(checked) => handleSettingsUpdate('showEmail', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Phone Number</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your phone</p>
            </div>
            <Switch
              checked={settings.showPhone}
              onCheckedChange={(checked) => handleSettingsUpdate('showPhone', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Messages</Label>
              <p className="text-sm text-muted-foreground">Allow other students to message you</p>
            </div>
            <Switch
              checked={settings.allowMessages}
              onCheckedChange={(checked) => handleSettingsUpdate('allowMessages', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Online Status</Label>
              <p className="text-sm text-muted-foreground">Show when you're online</p>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handleSettingsUpdate('showOnlineStatus', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAcademicSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Academic Preferences</CardTitle>
        <CardDescription>
          Configure your academic and calendar settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendarView">Default Calendar View</Label>
            <Select
              value={settingsData.defaultCalendarView}
              onValueChange={(value) => handleSettingsUpdate('defaultCalendarView', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeFormat">Grade Display Format</Label>
            <Select
              value={settingsData.gradeDisplayFormat}
              onValueChange={(value) => handleSettingsUpdate('gradeDisplayFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Letter">Letter (A, B, C)</SelectItem>
                <SelectItem value="Percentage">Percentage (85%, 90%)</SelectItem>
                <SelectItem value="Points">Points (4.0, 3.5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Weekends</Label>
              <p className="text-sm text-muted-foreground">
                Display weekends in calendar view
              </p>
            </div>
            <Switch
              checked={settingsData.showWeekends}
              onCheckedChange={(checked) => handleSettingsUpdate('showWeekends', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-sync Calendar</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync with external calendars
              </p>
            </div>
            <Switch
              checked={settingsData.autoSyncCalendar}
              onCheckedChange={(checked) => handleSettingsUpdate('autoSyncCalendar', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboardSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Preferences</CardTitle>
        <CardDescription>
          Customize your dashboard layout and content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
            <Select
              value={settingsData.dashboardLayout}
              onValueChange={(value) => handleSettingsUpdate('dashboardLayout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grid">Grid</SelectItem>
                <SelectItem value="List">List</SelectItem>
                <SelectItem value="Compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Upcoming Events</Label>
              <p className="text-sm text-muted-foreground">
                Display upcoming events on dashboard
              </p>
            </div>
            <Switch
              checked={settingsData.showUpcomingEvents}
              onCheckedChange={(checked) => handleSettingsUpdate('showUpcomingEvents', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Recent Grades</Label>
              <p className="text-sm text-muted-foreground">
                Display recent grades on dashboard
              </p>
            </div>
            <Switch
              checked={settingsData.showRecentGrades}
              onCheckedChange={(checked) => handleSettingsUpdate('showRecentGrades', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Progress Charts</Label>
              <p className="text-sm text-muted-foreground">
                Display progress charts and analytics
              </p>
            </div>
            <Switch
              checked={settingsData.showProgressCharts}
              onCheckedChange={(checked) => handleSettingsUpdate('showProgressCharts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Achievements</Label>
              <p className="text-sm text-muted-foreground">
                Display achievements and badges
              </p>
            </div>
            <Switch
              checked={settingsData.showAchievements}
              onCheckedChange={(checked) => handleSettingsUpdate('showAchievements', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppearanceSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize your interface preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={settings.theme} onValueChange={(value) => handleSettingsUpdate('theme', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={settings.language} onValueChange={(value) => handleSettingsUpdate('language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select value={settings.fontSize} onValueChange={(value) => handleSettingsUpdate('fontSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Use compact layout to fit more content</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleSettingsUpdate('compactMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <p className="text-sm text-muted-foreground">Enable interface animations</p>
            </div>
            <Switch
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => handleSettingsUpdate('animationsEnabled', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading settings...</span>
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
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                        activeTab === tab.id ? 'bg-muted border-r-2 border-primary' : ''
                      }`}
                    >
                      {React.createElement(tab.icon, { className: 'w-4 h-4' })}
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
             {activeTab === 'privacy' && renderPrivacySettings()}
             {activeTab === 'appearance' && renderAppearanceSettings()}
             {activeTab === 'academic' && renderAcademicSettings()}
             {activeTab === 'dashboard' && renderDashboardSettings()}
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              {error && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Settings saved successfully!</span>
                </div>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <Button 
                  variant="outline" 
                  onClick={handleResetSettings}
                  disabled={saving}
                >
                  Reset to Default
                </Button>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;