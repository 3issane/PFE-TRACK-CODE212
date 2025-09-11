import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, MapPin, User, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getRole, authHeader } from '@/auth';

// Utility helpers
const pad = (n)=> (n<10? '0'+n : ''+n);
const toKey = (date)=> `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
function getMonthMatrix(baseDate){
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay(); // 0 Sun ... 6 Sat
  const daysInMonth = new Date(year, month+1,0).getDate();
  const matrix = [];
  let current = 1 - startWeekDay; // start from Sunday before (or same day) of first week
  while (current <= daysInMonth) {
    const week = [];
    for (let i=0;i<7;i++){
      const d = new Date(year, month, current);
      week.push(d);
      current++;
    }
    matrix.push(week);
  }
  return matrix;
}

export default function Schedule() {
  const role = getRole();
  const [schedules, setSchedules] = useState([]); // loaded from backend or local after create
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(()=> new Date());
  const [selectedDate, setSelectedDate] = useState(()=> new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title:'', description:'', type:'LECTURE', startTime:'', endTime:'', location:'', date:'', studentTopicId:'', professorId:'' });
  const [types, setTypes] = useState([]);
  const [studentTopics, setStudentTopics] = useState([]); // detailed objects
  const [professors, setProfessors] = useState([]); // detailed objects
  const [infoDialog, setInfoDialog] = useState(false);

  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8080';

  // fetch schedules
  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/schedules`, { headers: { 'Content-Type':'application/json', ...authHeader() } });
      if (!res.ok){ setError('Failed to load'); setSchedules([]); }
      else { const data = await res.json(); setSchedules(Array.isArray(data)? data: []); }
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); fetchTypes(); fetchAllStudentTopics(); fetchAllProfessors(); },[]);

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/schedules/types`, { headers: { ...authHeader() } });
      if (res.status === 401) {
        // unauthorized; types endpoint likely protected. Leave types empty; fallback list will be used.
        return;
      }
      if (res.ok) { setTypes(await res.json()); }
    } catch {}
  };

  const fetchAllStudentTopics = async () => {
    try { const res = await fetch(`${API_BASE}/api/schedules/all-student-topics`, { headers:{...authHeader()} }); if(res.ok){ setStudentTopics(await res.json()); } } catch {}
  };

  const fetchAllProfessors = async () => {
    try { const res = await fetch(`${API_BASE}/api/schedules/professors`, { headers:{...authHeader()} }); if(res.ok){ setProfessors(await res.json()); } } catch {}
  };

  // group schedules by date key
  const grouped = useMemo(()=>{
    const map = {}; 
    for(const s of schedules){
      if(!s.date) continue;
      map[s.date] = map[s.date] || [];
      map[s.date].push(s);
    }
    return map;
  },[schedules]);

  const monthMatrix = useMemo(()=> getMonthMatrix(month), [month]);

  const selectDay = (d)=> {
    setSelectedDate(d);
    setInfoDialog(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSchedule.title || !newSchedule.startTime || !newSchedule.endTime) return;
    const dateKey = toKey(selectedDate);
    try {
      let studentTopicId = null;
      let professorId = null;
      if (newSchedule.type === 'PFE PRESENTATION') {
        if (!newSchedule.studentTopicId) return; // enforce selection
        studentTopicId = Number(newSchedule.studentTopicId);
        // derive professor from chosen student topic detail
        const chosen = studentTopics.find(st => String(st.studentTopicId) === String(studentTopicId));
        if (chosen) professorId = chosen.professorId;
      } else { // Lecture / Exam
        if (!newSchedule.professorId) return; // require professor selection
        professorId = Number(newSchedule.professorId);
      }
      const payload = { title: newSchedule.title, description: newSchedule.description, type: newSchedule.type.replace(' ','_'), date: dateKey, startTime: newSchedule.startTime, endTime: newSchedule.endTime, location: newSchedule.location, studentTopicId, professorId };
      const res = await fetch(`${API_BASE}/api/schedules`, { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeader() }, body: JSON.stringify(payload) });
      if (res.ok){
        const created = await res.json();
        setSchedules(prev=>[...prev, created]);
        setCreateOpen(false);
        setNewSchedule({ title:'', description:'', type:'LECTURE', startTime:'', endTime:'', location:'', date:'', studentTopicId:'', professorId:'' });
      }
    } catch {}
  };

  const loadingNode = <div className='flex items-center justify-center h-40'><div className='animate-spin h-8 w-8 rounded-full border-b-2 border-primary'/></div>;

  const monthLabel = month.toLocaleString(undefined,{ month:'long', year:'numeric'});

  const changeMonth = (delta)=> {
    setMonth(m=> new Date(m.getFullYear(), m.getMonth()+delta,1));
  };

  const daySchedules = grouped[toKey(selectedDate)] || [];

  const content = (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Schedule</h1>
          <p className='text-muted-foreground text-sm'>Select a date, add entries, and click a filled day to view details.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={()=>changeMonth(-1)} aria-label='Previous month'><ChevronLeft className='h-4 w-4'/></Button>
          <div className='font-medium w-40 text-center'>{monthLabel}</div>
          <Button variant='outline' size='icon' onClick={()=>changeMonth(1)} aria-label='Next month'><ChevronRight className='h-4 w-4'/></Button>
          {(role==='ADMIN'|| role==='PROFESSOR') && (
            <Button onClick={()=> setCreateOpen(true)}><Plus className='h-4 w-4 mr-1'/>Add</Button>
          )}
        </div>
      </div>

      {error && <div className='text-sm text-red-600'>{error}</div>}

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* Calendar */}
        <Card className='xl:col-span-2'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>Month View</CardTitle>
            <CardDescription>Select a day to view or add schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-7 text-xs font-medium text-muted-foreground mb-2'>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className='text-center p-1'>{d}</div>)}
            </div>
            <div className='grid grid-cols-7 gap-1'>
              {monthMatrix.flat().map((d,i)=> {
                const inMonth = d.getMonth() === month.getMonth();
                const key = toKey(d);
                const filled = !!grouped[key];
                const isSelected = toKey(d) === toKey(selectedDate);
                const isToday = toKey(d) === toKey(new Date());
                return (
                  <button
                    key={i}
                    onClick={()=> selectDay(d)}
                    className={[
                      'relative flex flex-col items-center justify-center rounded-md border p-2 h-20 text-xs transition',
                      inMonth? 'bg-background' : 'bg-muted/30 text-muted-foreground',
                      isSelected? 'ring-2 ring-primary' : '',
                      filled? 'border-primary/50' : 'border-border',
                      'hover:bg-accent hover:text-accent-foreground'
                    ].join(' ')}
                  >
                    <span className='absolute top-1 left-1 text-[10px] font-medium'>
                      {d.getDate()}
                    </span>
                    {filled && (
                      <span className='mt-auto mb-1 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
                        {grouped[key].length} {grouped[key].length===1? 'item':'items'}
                      </span>
                    )}
                    {isToday && <span className='absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary' />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card className='xl:col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Info className='h-4 w-4'/>
              {selectedDate.toLocaleDateString(undefined,{ weekday:'long', month:'short', day:'numeric', year:'numeric'})}
            </CardTitle>
            <CardDescription>
              {daySchedules.length? `${daySchedules.length} schedule${daySchedules.length>1?'s':''}` : 'No schedules yet'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {daySchedules.length === 0 && (
              <div className='text-sm text-muted-foreground'>Choose Add to create a schedule for this date.</div>
            )}
            {daySchedules.map(s => (
              <div key={s.id} className='border rounded-md p-3 space-y-2 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{s.title}</span>
                  <Badge variant='outline'>{s.type}</Badge>
                </div>
                <div className='flex items-center text-muted-foreground gap-4'>
                  <span className='flex items-center gap-1'><Clock className='h-3 w-3'/>{s.startTime} - {s.endTime}</span>
                  {s.location && <span className='flex items-center gap-1'><MapPin className='h-3 w-3'/>{s.location}</span>}
                </div>
                {s.description && <p className='text-muted-foreground text-xs leading-snug'>{s.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <Sidebar><AppSidebar /></Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
          {loading ? loadingNode : content}
        </div>
      </SidebarInset>

      {/* Create Schedule Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>New Schedule</DialogTitle>
            <DialogDescription>{selectedDate.toDateString()}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className='space-y-4'>
            <div className='space-y-1'>
              <Label>Title</Label>
              <Input value={newSchedule.title} onChange={e=>setNewSchedule(s=>({...s,title:e.target.value}))} required />
            </div>
            <div className='space-y-1'>
              <Label>Type</Label>
              <Select value={newSchedule.type} onValueChange={v=>setNewSchedule(s=>({...s,type:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(types.length? types : ['LECTURE','PFE_PRESENTATION','EXAM']).map(t=> <SelectItem key={t} value={t.replace('_',' ')}>{t.replace('_',' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {newSchedule.type === 'PFE PRESENTATION' && (
              <div className='space-y-2'>
                <div className='space-y-1'>
                  <Label>Student Topic</Label>
                  <Select value={newSchedule.studentTopicId} onValueChange={v=> setNewSchedule(s=>({...s,studentTopicId:v}))}>
                    <SelectTrigger><SelectValue placeholder='Select Student Topic' /></SelectTrigger>
                    <SelectContent>
                      {studentTopics.map(st => (
                        <SelectItem key={st.studentTopicId} value={String(st.studentTopicId)}>
                          {st.topicTitle} (Student #{st.studentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newSchedule.studentTopicId && (()=>{
                  const chosen = studentTopics.find(st=> String(st.studentTopicId)===String(newSchedule.studentTopicId));
                  if(!chosen) return null;
                  return <div className='text-xs text-muted-foreground'>Professor: {chosen.professorName || `#${chosen.professorId}`}</div>;
                })()}
              </div>
            )}
            {newSchedule.type !== 'PFE PRESENTATION' && (
              <div className='space-y-1'>
                <Label>Professor</Label>
                <Select value={newSchedule.professorId} onValueChange={v=> setNewSchedule(s=>({...s,professorId:v}))}>
                  <SelectTrigger><SelectValue placeholder='Select Professor' /></SelectTrigger>
                  <SelectContent>
                    {professors.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.firstName || ''} {p.lastName || ''} ({p.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Label>Start</Label>
                <Input type='time' value={newSchedule.startTime} onChange={e=>setNewSchedule(s=>({...s,startTime:e.target.value}))} required />
              </div>
              <div className='space-y-1'>
                <Label>End</Label>
                <Input type='time' value={newSchedule.endTime} onChange={e=>setNewSchedule(s=>({...s,endTime:e.target.value}))} required />
              </div>
            </div>
            <div className='space-y-1'>
              <Label>Location</Label>
              <Input value={newSchedule.location} onChange={e=>setNewSchedule(s=>({...s,location:e.target.value}))} />
            </div>
            <div className='space-y-1'>
              <Label>Description</Label>
              <Textarea rows={3} value={newSchedule.description} onChange={e=>setNewSchedule(s=>({...s,description:e.target.value}))} />
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={()=>setCreateOpen(false)}>Cancel</Button>
              <Button type='submit'>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
