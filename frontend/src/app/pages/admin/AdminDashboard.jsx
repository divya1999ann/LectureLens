import React, { useState } from 'react';
import { Users, Activity, Shield, UserPlus, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { mockTeachers } from '../../utils/mockData';

const StatCard = ({ title, value, icon: Icon, iconBg, subtext }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
          {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AddTeacherModal = ({ open, onOpenChange, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', email: '', password: '', department: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Dr. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              placeholder="Computer Science"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Teacher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState(mockTeachers);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddTeacher = (newTeacher) => {
    const teacher = {
      id: teachers.length + 1,
      ...newTeacher,
      subjects: 0,
      students: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setTeachers([...teachers, teacher]);
  };

  const toggleStatus = (id) => {
    setTeachers(teachers.map(t =>
      t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
    ));
  };

  const deleteTeacher = (id) => {
    if (confirm('Are you sure you want to remove this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const totalStudents = teachers.reduce((sum, t) => sum + t.students, 0);
  const activeCourses = teachers.reduce((sum, t) => sum + t.subjects, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage teachers and system settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teachers"
          value={teachers.length}
          icon={Users}
          iconBg="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          iconBg="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Active Courses"
          value={activeCourses}
          icon={Activity}
          iconBg="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="System Uptime"
          value="99.8%"
          icon={Shield}
          iconBg="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Teacher Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teacher Management</CardTitle>
            <Button onClick={() => setModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Subjects</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Students</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Joined Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {teacher.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{teacher.email}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{teacher.subjects}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{teacher.students}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(teacher.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleStatus(teacher.id)}>
                        <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                          {teacher.status}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTeacher(teacher.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddTeacherModal open={modalOpen} onOpenChange={setModalOpen} onAdd={handleAddTeacher} />
    </div>
  );
};

export default AdminDashboard;
