import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Plus,
  Search
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import DashboardLayout from '../components/layout/DashboardLayout';
import { reportsAPI } from '../services/api';

const StudentReports = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: '',
    description: '',
    file: null
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await reportsAPI.getMy();
        setReports(data);
      } catch (err) {
        setError('Failed to load reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const mockReports = [
    {
      id: 1,
      title: "Project Proposal",
      type: "Proposal",
      submissionDate: "2024-01-15",
      dueDate: "2024-01-20",
      status: "Submitted",
      grade: "18/20",
      size: "2.5 MB",
      feedback: "Excellent proposal with clear objectives and methodology. Minor improvements needed in the timeline section.",
      supervisor: "Dr. Ahmed Khouani",
      fileName: "project_proposal_v2.pdf"
    },
    {
      id: 2,
      title: "Literature Review",
      type: "Literature Review",
      submissionDate: "2024-02-10",
      dueDate: "2024-02-15",
      status: "Graded",
      grade: "16/20",
      size: "4.2 MB",
      feedback: "Good coverage of relevant literature. Consider adding more recent publications and improving the critical analysis.",
      supervisor: "Dr. Ahmed Khouani",
      fileName: "literature_review.pdf"
    },
    {
      id: 3,
      title: "Progress Report 1",
      type: "Progress Report",
      submissionDate: "2024-03-05",
      dueDate: "2024-03-10",
      status: "Submitted",
      grade: null,
      size: "1.8 MB",
      feedback: null,
      supervisor: "Dr. Ahmed Khouani",
      fileName: "progress_report_1.pdf"
    },
    {
      id: 4,
      title: "Technical Documentation",
      type: "Documentation",
      submissionDate: null,
      dueDate: "2024-04-01",
      status: "Pending",
      grade: null,
      size: null,
      feedback: null,
      supervisor: "Dr. Ahmed Khouani",
      fileName: null
    },
    {
      id: 5,
      title: "Final Report",
      type: "Final Report",
      submissionDate: null,
      dueDate: "2024-05-15",
      status: "Pending",
      grade: null,
      size: null,
      feedback: null,
      supervisor: "Dr. Ahmed Khouani",
      fileName: null
    },
    {
      id: 6,
      title: "Presentation Slides",
      type: "Presentation",
      submissionDate: null,
      dueDate: "2024-05-20",
      status: "Pending",
      grade: null,
      size: null,
      feedback: null,
      supervisor: "Dr. Ahmed Khouani",
      fileName: null
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Submitted":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "Graded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Overdue":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Graded":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Proposal":
        return "bg-purple-100 text-purple-800";
      case "Literature Review":
        return "bg-indigo-100 text-indigo-800";
      case "Progress Report":
        return "bg-blue-100 text-blue-800";
      case "Documentation":
        return "bg-green-100 text-green-800";
      case "Final Report":
        return "bg-red-100 text-red-800";
      case "Presentation":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Use API data if available, otherwise fall back to mock data
  const displayReports = reports.length > 0 ? reports : mockReports;

  const filteredReports = displayReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || report.type === selectedType;
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const submittedReports = displayReports.filter(r => r.status === "Submitted" || r.status === "Graded").length;
  const totalReports = displayReports.length;
  const progressPercentage = (submittedReports / totalReports) * 100;

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.type || !uploadForm.file) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      
      const response = await reportsAPI.createWithFile(formData);
      
      if (response.ok) {
        const updatedReports = await reportsAPI.getMy();
        setReports(updatedReports);
        setUploadDialogOpen(false);
        setUploadForm({ title: '', type: '', description: '', file: null });
        alert("Report uploaded successfully!");
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      alert("Failed to upload report. Please try again.");
      console.error('Error uploading report:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await reportsAPI.downloadFile(reportId);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      alert("Failed to download file. Please try again.");
      console.error('Error downloading file:', err);
    }
  };

  const handleView = async (reportId) => {
    try {
      const response = await reportsAPI.getFile(reportId);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('View failed');
      }
    } catch (err) {
      alert("Failed to view file. Please try again.");
      console.error('Error viewing file:', err);
    }
  };

  const handleDelete = async (reportId) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await reportsAPI.delete(reportId);
        setReports(prev => prev.filter(report => report.id !== reportId));
        alert(`Report ${reportId} deleted`);
      } catch (err) {
        alert("Failed to delete report. Please try again.");
        console.error('Error deleting report:', err);
      }
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Manage your project reports, submissions, and track your progress.
          </p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Progress</CardTitle>
            <CardDescription>
              Track your overall report submission progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {submittedReports} of {totalReports} reports submitted
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {displayReports.filter(r => r.status === "Graded").length}
                </div>
                <div className="text-sm text-green-600">Graded</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {displayReports.filter(r => r.status === "Submitted").length}
                </div>
                <div className="text-sm text-blue-600">Submitted</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {displayReports.filter(r => r.status === "Pending").length}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {displayReports.filter(r => r.status === "Overdue").length}
                  </div>
                  <div className="text-sm text-red-600">Overdue</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reports Management</CardTitle>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Upload Report</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Report</DialogTitle>
                    <DialogDescription>
                      Submit your project report for review
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportTitle">Report Title *</Label>
                      <Input 
                        id="reportTitle"
                        placeholder="Enter report title"
                        value={uploadForm.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reportType">Report Type *</Label>
                      <Select value={uploadForm.type} onValueChange={(value) => handleFormChange('type', value)}>
                        <SelectTrigger id="reportType">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Proposal">Proposal</SelectItem>
                          <SelectItem value="Literature Review">Literature Review</SelectItem>
                          <SelectItem value="Progress Report">Progress Report</SelectItem>
                          <SelectItem value="Documentation">Documentation</SelectItem>
                          <SelectItem value="Final Report">Final Report</SelectItem>
                          <SelectItem value="Presentation">Presentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file">File *</Label>
                      <Input 
                        id="file" 
                        type="file" 
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => handleFormChange('file', e.target.files[0])}
                      />
                      {uploadForm.file && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea 
                        id="description"
                        placeholder="Add any additional notes or comments..."
                        rows={3}
                        value={uploadForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpload} 
                        className="flex-1"
                        disabled={uploading || !uploadForm.title || !uploadForm.type || !uploadForm.file}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Report'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setUploadDialogOpen(false);
                          setUploadForm({ title: '', type: '', description: '', file: null });
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Reports</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Literature Review">Literature Review</SelectItem>
                    <SelectItem value="Progress Report">Progress Report</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Final Report">Final Report</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Graded">Graded</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedStatus("all");
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
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
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
                  Showing {filteredReports.length} of {displayReports.length} reports
                </p>
              </div>
            )}

           {!loading && !error && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{report.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Supervisor: {report.supervisor}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(report.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Type and Status */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Due Date</p>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(report.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {report.submissionDate && (
                      <div>
                        <p className="font-medium text-muted-foreground">Submitted</p>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(report.submissionDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  {report.fileName && (
                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground">File</p>
                      <div className="flex items-center justify-between">
                        <span>{report.fileName}</span>
                        <span className="text-muted-foreground">{report.size}</span>
                      </div>
                    </div>
                  )}

                  {/* Grade */}
                  {report.grade && (
                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground">Grade</p>
                      <div className="text-lg font-bold text-green-600">{report.grade}</div>
                    </div>
                  )}

                  {/* Feedback */}
                  {report.feedback && (
                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground mb-1">Supervisor Feedback</p>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{report.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    {report.status === "Pending" ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload {report.title}</DialogTitle>
                            <DialogDescription>
                              Submit your {report.type.toLowerCase()} for review
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="file">File</Label>
                              <Input id="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="description">Description (Optional)</Label>
                              <Textarea 
                                id="description"
                                placeholder="Add any additional notes or comments..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button onClick={handleUpload} className="flex-1">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Report
                              </Button>
                              <Button variant="outline">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleView(report.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload(report.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        {report.status === "Submitted" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(report.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No reports found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </div>
          )}
         </div>
       </div>
     </DashboardLayout>
   );
 };

 export default StudentReports;