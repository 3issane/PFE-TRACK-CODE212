import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getRole, authHeader } from '@/auth';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, XCircle, Plus, MessageSquare } from 'lucide-react';

// Helper mapping for status (backend may return uppercase like SUBMITTED)
const normalize = (s) => (s || '').toUpperCase();

const iconStatus = s => {
  const n = normalize(s);
  const map = {
    SUBMITTED: <CheckCircle className='w-4 h-4 text-blue-500' />,
    GRADED: <CheckCircle className='w-4 h-4 text-green-500' />,
    PENDING: <Clock className='w-4 h-4 text-yellow-500' />,
    OVERDUE: <XCircle className='w-4 h-4 text-red-500' />
  };
  return map[n] || <AlertCircle className='w-4 h-4 text-gray-500' />;
};

const statusColor = s => {
  const n = normalize(s);
  const map = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    GRADED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    OVERDUE: 'bg-red-100 text-red-800'
  };
  return map[n] || 'bg-gray-100 text-gray-800';
};

const typeColor = t => ({
  Proposal: 'bg-purple-100 text-purple-800',
  'Literature Review': 'bg-indigo-100 text-indigo-800',
  'Progress Report': 'bg-blue-100 text-blue-800',
  Documentation: 'bg-green-100 text-green-800',
  'Final Report': 'bg-red-100 text-red-800',
  Presentation: 'bg-orange-100 text-orange-800',
}[t] || 'bg-gray-100 text-gray-800');

const StudentReports = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [hasTopic, setHasTopic] = useState(false);
  const [topicChecked, setTopicChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const role = getRole();

  // student upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', type: '', file: null });
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  // feedback state (professor)
  const [feedbackOpenId, setFeedbackOpenId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8080';

  const fetchReports = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/reports`, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
      if (res.status === 401) { setError('Unauthorized (login again)'); return; }
      if (res.status === 403) { setError('Forbidden'); return; }
      if (!res.ok) { setError(`Failed (${res.status})`); return; }
      const data = await res.json();
      setReports(data);
    } catch (e) {
      setError('Network error');
    } finally { setLoading(false); }
  };

  const navigate = useNavigate();

  const checkTopic = async () => {
    if (role !== 'STUDENT') { setHasTopic(true); setTopicChecked(true); return; }
    try {
      const res = await fetch(`${API_BASE}/api/topics/my-topic`, { headers: { ...authHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.topicId) {
          setHasTopic(true);
        }
      }
    } catch {}
    finally { setTopicChecked(true); }
  };

  useEffect(() => { (async ()=> { await checkTopic(); })(); }, []);
  useEffect(() => { if (topicChecked && hasTopic) fetchReports(); }, [topicChecked, hasTopic]);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) || (r.type || '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || r.type === typeFilter;
      const matchStatus = statusFilter === 'all' || normalize(r.status) === normalize(statusFilter);
      return matchSearch && matchType && matchStatus;
    });
  }, [reports, search, typeFilter, statusFilter]);

  const reset = () => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); };

  const submitUpload = async (e) => {
    e.preventDefault();
  if (!uploadForm.title || !uploadForm.type) return;
    setUploadSubmitting(true);
    try {
      const body = {
        title: uploadForm.title,
        type: uploadForm.type,
        fileName: uploadForm.file ? uploadForm.file.name : uploadForm.title + '.pdf',
        size: uploadForm.file ? uploadForm.file.size : 0,
  // supervisor inferred from studentTopic server-side
      };
  const res = await fetch(`${API_BASE}/api/reports/student`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(body) });
      if (res.ok) {
        setUploadOpen(false);
  setUploadForm({ title: '', type: '', file: null });
        fetchReports();
      }
    } finally { setUploadSubmitting(false); }
  };

  const openFeedback = (report) => { setFeedbackOpenId(report.id); setFeedbackText(report.feedback || ''); };
  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackOpenId) return;
    setFeedbackSubmitting(true);
    try {
  const res = await fetch(`${API_BASE}/api/reports/${feedbackOpenId}/feedback`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ feedback: feedbackText }) });
      if (res.ok) { setFeedbackOpenId(null); fetchReports(); }
    } finally { setFeedbackSubmitting(false); }
  };

  return (
    <SidebarProvider>
      <Sidebar><AppSidebar /></Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
          {role === 'STUDENT' && topicChecked && !hasTopic && (
            <Card className='border-dashed bg-muted/40 backdrop-blur-sm shadow-none mt-6 mb-2 mx-2 md:mx-4 max-w-2xl'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <span className='inline-block px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary font-medium tracking-wide'>Action Required</span>
                  Apply for a Topic First
                </CardTitle>
                <CardDescription className='leading-relaxed'>You must apply to and be assigned a PFE topic before you can upload or view reports. Once assigned, this page will automatically show your report list.</CardDescription>
              </CardHeader>
              <CardContent className='pt-0'>
                <Button onClick={()=>navigate('/student/topics')} size='sm'>Browse Topics</Button>
              </CardContent>
            </Card>
          )}
          {(!topicChecked || (role === 'STUDENT' && !hasTopic)) ? null : (
            <>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>Reports</h1>
            <p className='text-muted-foreground'>Your submitted reports and their status.</p>
          </div>

          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='text-sm text-muted-foreground'>Total: {reports.length}</div>
            {role === 'STUDENT' && (
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size='sm'><Plus className='w-4 h-4 mr-1' />Upload Report</Button>
                </DialogTrigger>
                <DialogContent className='max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Upload Report (metadata)</DialogTitle>
                    <DialogDescription>Provide report info. File storage is a placeholder.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={submitUpload} className='space-y-4'>
                    <div className='space-y-1'>
                      <Label>Title</Label>
                      <Input value={uploadForm.title} onChange={e=>setUploadForm(f=>({...f,title:e.target.value}))} required />
                    </div>
                    <div className='space-y-1'>
                      <Label>Type</Label>
                      <Select value={uploadForm.type} onValueChange={v=>setUploadForm(f=>({...f,type:v}))}>
                        <SelectTrigger><SelectValue placeholder='Select type' /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Proposal'>Proposal</SelectItem>
                          <SelectItem value='Literature Review'>Literature Review</SelectItem>
                          <SelectItem value='Progress Report'>Progress Report</SelectItem>
                          <SelectItem value='Documentation'>Documentation</SelectItem>
                          <SelectItem value='Final Report'>Final Report</SelectItem>
                          <SelectItem value='Presentation'>Presentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Supervisor derived from your topic assignment; field removed */}
                    <div className='space-y-1'>
                      <Label>File (placeholder)</Label>
                      <Input type='file' onChange={e=>setUploadForm(f=>({...f,file:e.target.files?.[0]||null}))} />
                      <p className='text-xs text-muted-foreground'>Actual file storage not implemented yet.</p>
                    </div>
                    <div className='flex justify-end gap-2'>
                      <Button type='button' variant='outline' onClick={()=>setUploadOpen(false)}>Cancel</Button>
                      <Button type='submit' disabled={uploadSubmitting}>{uploadSubmitting ? 'Submitting...' : 'Submit'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search by title/type and narrow by type or status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-4'>
                <div className='space-y-2'>
                  <Label htmlFor='searchReports'>Search</Label>
                  <Input id='searchReports' placeholder='Search...' value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
                <div className='space-y-2'>
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder='Type' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All</SelectItem>
                      <SelectItem value='Proposal'>Proposal</SelectItem>
                      <SelectItem value='Literature Review'>Literature Review</SelectItem>
                      <SelectItem value='Progress Report'>Progress Report</SelectItem>
                      <SelectItem value='Documentation'>Documentation</SelectItem>
                      <SelectItem value='Final Report'>Final Report</SelectItem>
                      <SelectItem value='Presentation'>Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder='Status' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All</SelectItem>
                      <SelectItem value='Pending'>Pending</SelectItem>
                      <SelectItem value='Submitted'>Submitted</SelectItem>
                      <SelectItem value='Graded'>Graded</SelectItem>
                      <SelectItem value='Overdue'>Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-end'>
                  <Button variant='outline' className='w-full' onClick={reset}>Clear</Button>
                </div>
              </div>
              <p className='mt-4 text-sm text-muted-foreground'>Showing {filtered.length} of {reports.length} reports</p>
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {loading && <div className='col-span-full text-center py-10 text-sm text-muted-foreground'>Loading...</div>}
            {error && !loading && <div className='col-span-full text-center py-10 text-sm text-red-500'>{error}</div>}
            {!loading && !error && filtered.map(r => (
              <Card key={r.id} className='hover:shadow-lg transition-shadow'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 rounded-lg bg-blue-100 text-blue-600'><FileText className='w-5 h-5' /></div>
                      <div className='flex-1'>
                        <CardTitle className='text-lg leading-tight'>{r.title}</CardTitle>
                        <CardDescription className='mt-1'>Topic: {r.topicTitle || '-'} · Supervisor: {r.supervisorEmail || '-'}</CardDescription>
                      </div>
                    </div>
                    <div>{iconStatus(r.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    <Badge className={typeColor(r.type)}>{r.type}</Badge>
                    <Badge className={statusColor(r.status)}>{(r.status||'').toUpperCase()}</Badge>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='font-medium text-muted-foreground'>Submitted</p>
                      <div className='flex items-center gap-1'><Calendar className='w-4 h-4 text-muted-foreground' /><span>{r.submissionDate ? new Date(r.submissionDate).toLocaleDateString() : '-'}</span></div>
                    </div>
                    {r.grade && (
                      <div>
                        <p className='font-medium text-muted-foreground'>Grade</p>
                        <div className='text-lg font-bold text-green-600'>{r.grade}</div>
                      </div>
                    )}
                  </div>
                  {r.fileName && (
                    <div className='text-sm'>
                      <p className='font-medium text-muted-foreground'>File</p>
                      <div className='flex items-center justify-between'><span>{r.fileName}</span><span className='text-muted-foreground'>{r.size ? (r.size/1024).toFixed(1)+' KB' : ''}</span></div>
                    </div>
                  )}
                  {r.grade && (
                    <div className='hidden' />
                  )}
                  {r.feedback && (
                    <div className='text-sm'>
                      <p className='font-medium text-muted-foreground mb-1'>Supervisor Feedback</p>
                      <div className='p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap'>{r.feedback}</div>
                    </div>
                  )}
                  {/* Feedback editing removed for student view */}
                </CardContent>
              </Card>
            ))}
            {!loading && !error && filtered.length === 0 && (
              <div className='col-span-full text-center py-12 text-muted-foreground'>No reports found.</div>
            )}
          </div>
          {/* Professor feedback dialog removed in student customization */}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default StudentReports;
