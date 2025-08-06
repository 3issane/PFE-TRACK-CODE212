import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import eventApi from '../services/eventApi';

const StudentSchedule = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'exam', 'pfe', 'meeting'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = {
          includePublic: true
        };
        if (filterType !== 'all') {
          params.type = filterType;
        }
        const response = await eventApi.getEvents(params);
        setEvents(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        // Use sample data as fallback when API fails
        setEvents(sampleEvents);
        setError('');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEvents();
    } else {
      // Show sample data when not authenticated
      setEvents(sampleEvents);
      setError('Please log in to view your actual schedule. Showing sample data.');
      setLoading(false);
    }
  }, [filterType, currentUser]);
  
  // Sample events data - fallback for when API is not available
  const sampleEvents = [
    {
      id: 1,
      title: "Mid-term Exam",
      date: "2024-04-15",
      time: "09:00",
      type: "exam",
      description: "Database Systems Mid-term Examination",
      location: "Room A101",
      status: "upcoming"
    },
    {
      id: 2,
      title: "PFE Progress Presentation",
      date: "2024-04-20",
      time: "14:00",
      type: "pfe",
      description: "Present your project progress to the committee",
      location: "Conference Room B",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Supervisor Meeting",
      date: "2024-04-18",
      time: "10:30",
      type: "meeting",
      description: "Weekly progress discussion with Prof. Ahmed",
      location: "Office 205",
      status: "upcoming"
    },
    {
      id: 4,
      title: "Final Report Submission",
      date: "2024-05-15",
      time: "23:59",
      type: "pfe",
      description: "Submit your final PFE report",
      location: "Online Portal",
      status: "upcoming"
    },
    {
      id: 5,
      title: "Thesis Defense",
      date: "2024-06-10",
      time: "09:00",
      type: "pfe",
      description: "Final thesis defense presentation",
      location: "Amphitheater A",
      status: "scheduled"
    },
    {
      id: 6,
      title: "Software Engineering Exam",
      date: "2024-04-25",
      time: "08:00",
      type: "exam",
      description: "Software Engineering Final Exam",
      location: "Room C203",
      status: "upcoming"
    }
  ];
  
  // Use sample data if no events from API or not authenticated
  const displayEvents = currentUser && events.length > 0 ? events : sampleEvents;
  
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'exam':
        return 'destructive';
      case 'pfe':
        return 'default';
      case 'meeting':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'exam':
        return <AlertTriangle className="w-4 h-4" />;
      case 'pfe':
        return <BookOpen className="w-4 h-4" />;
      case 'meeting':
        return <Clock className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };
  
  const filteredEvents = displayEvents.filter(event => {
    if (filterType === 'all') return true;
    return event.type === filterType;
  });
  
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
  
  const handleDateClick = (date, month, year) => {
    const clickedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    setSelectedDate(clickedDate);
  };
  
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return displayEvents.filter(event => {
      const eventDate = event.eventDate || event.date;
      return eventDate === selectedDate;
    });
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const getDaysUntil = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Schedule & Calendar</h1>
          <p className="text-muted-foreground">
            View your exam dates, PFE deadlines, and important meetings.
          </p>
          {error && (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
        
        {/* View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Clock className="w-4 h-4 mr-2" />
              List View
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All Events
            </Button>
            <Button
              variant={filterType === 'exam' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setFilterType('exam')}
            >
              Exams
            </Button>
            <Button
              variant={filterType === 'pfe' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('pfe')}
            >
              PFE Events
            </Button>
            <Button
              variant={filterType === 'meeting' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('meeting')}
            >
              Meetings
            </Button>
          </div>
        </div>
        
        {viewMode === 'calendar' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Calendar 
                events={filteredEvents} 
                onDateClick={handleDateClick}
              />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Events */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {formatDate(selectedDate)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getEventsForSelectedDate().length > 0 ? (
                      <div className="space-y-3">
                        {getEventsForSelectedDate().map(event => (
                          <div key={event.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getEventTypeIcon(event.type)}
                                <span className="font-medium text-sm">{event.title}</span>
                              </div>
                              <Badge variant={getEventTypeColor(event.type)} className="text-xs">
                                {event.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p><Clock className="w-3 h-3 inline mr-1" />{formatTime(event.eventTime || event.time)}</p>
                              <p>{event.location}</p>
                            </div>
                            <p className="text-sm">{event.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No events scheduled for this date.</p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Upcoming Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map(event => {
                      const daysUntil = getDaysUntil(event.eventDate || event.date);
                      return (
                        <div key={event.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getEventTypeIcon(event.type)}
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                            <Badge 
                              variant={daysUntil <= 3 ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {daysUntil === 0 ? 'Today' : 
                               daysUntil === 1 ? 'Tomorrow' : 
                               `${daysUntil} days`}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <p>{formatDate(event.eventDate || event.date)} at {formatTime(event.eventTime || event.time)}</p>
                            <p>{event.location}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>
                    Complete list of your scheduled events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEvents
                      .sort((a, b) => new Date(a.eventDate || a.date) - new Date(b.eventDate || b.date))
                      .map(event => {
                        const daysUntil = getDaysUntil(event.eventDate || event.date);
                        const isPast = daysUntil < 0;
                        
                        return (
                          <div key={event.id} className={`p-4 border rounded-lg space-y-3 ${
                            isPast ? 'opacity-60' : ''
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getEventTypeIcon(event.type)}
                                <div>
                                  <h3 className="font-medium">{event.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(event.eventDate || event.date)} at {formatTime(event.eventTime || event.time)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getEventTypeColor(event.type)}>
                                  {event.type}
                                </Badge>
                                {!isPast && (
                                  <Badge 
                                    variant={daysUntil <= 3 ? 'destructive' : 'outline'}
                                  >
                                    {daysUntil === 0 ? 'Today' : 
                                     daysUntil === 1 ? 'Tomorrow' : 
                                     `${daysUntil} days`}
                                  </Badge>
                                )}
                                {isPast && (
                                  <Badge variant="secondary">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Past
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="pl-7">
                              <p className="text-sm text-muted-foreground mb-2">
                                📍 {event.location}
                              </p>
                              <p className="text-sm">{event.description}</p>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Statistics Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Events</span>
                      <Badge variant="outline">{displayEvents.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Upcoming Exams</span>
                      <Badge variant="destructive">
                        {displayEvents.filter(e => e.type === 'exam' && getDaysUntil(e.eventDate || e.date) >= 0).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">PFE Deadlines</span>
                      <Badge variant="default">
                        {displayEvents.filter(e => e.type === 'pfe' && getDaysUntil(e.eventDate || e.date) >= 0).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meetings</span>
                      <Badge variant="secondary">
                        {displayEvents.filter(e => e.type === 'meeting' && getDaysUntil(e.eventDate || e.date) >= 0).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Personal Event
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Export Calendar
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Sync with Google Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentSchedule;