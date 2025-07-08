import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Book, Tag, TrendingUp, Plus, Search, Edit, Trash2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: api.getAdminStats,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: api.getUsers,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: api.getCourses,
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery({
    queryKey: ['/api/certificates'],
    queryFn: api.getCertificates,
  });

  const importCsvMutation = useMutation({
    mutationFn: api.importCsv,
    onSuccess: (data) => {
      toast({
        title: "CSV Import Successful",
        description: `Imported ${data.imported.users} users and ${data.imported.certificates} certificates.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: "Failed to import CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const deleteCourseM8mutation = useMutation({
    mutationFn: api.deleteCourse,
    onSuccess: () => {
      toast({
        title: "Course Deleted",
        description: "Course has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }
    importCsvMutation.mutate(selectedFile);
  };

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (statsLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" className="mt-20" />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600">Manage courses, users, and certificates</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Students"
          value={stats?.totalUsers || 0}
          icon={Users}
          iconColor="text-primary"
          bgColor="bg-primary/10"
        />
        <StatsCard
          title="Active Courses"
          value={stats?.totalCourses || 0}
          icon={Book}
          iconColor="text-secondary-green"
          bgColor="bg-secondary-green/10"
        />
        <StatsCard
          title="Certificates Issued"
          value={stats?.totalCertificates || 0}
          icon={Tag}
          iconColor="text-accent-orange"
          bgColor="bg-accent-orange/10"
        />
        <StatsCard
          title="This Month"
          value={stats?.totalEnrollments || 0}
          icon={TrendingUp}
          iconColor="text-red-500"
          bgColor="bg-red-500/10"
        />
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-800">Student Management</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border-neutral-200"
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </div>
              </div>

              {usersLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {filteredUsers?.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                user.role === 'admin' 
                                  ? 'bg-black' 
                                  : 'bg-[#FCD307]'
                              }`}>
                                <span className={`text-sm font-medium ${
                                  user.role === 'admin' 
                                    ? 'text-[#FCD307]' 
                                    : 'text-black'
                                }`}>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-800">{user.name}</div>
                                <div className="text-sm text-neutral-500">
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="bg-secondary-green/10 text-secondary-green">
                              Active
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-800">Course Management</h2>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </div>

              {coursesLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses?.map((course) => (
                    <Card key={course.id} className="border border-neutral-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <i className={`${course.icon} text-primary`} />
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteCourseM8mutation.mutate(course.id)}
                              disabled={deleteCourseM8mutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-neutral-800 mb-2">{course.title}</h3>
                        <p className="text-sm text-neutral-600 mb-3">{course.description}</p>
                        <div className="flex items-center justify-between text-sm text-neutral-500">
                          <span>{course.duration} hours</span>
                          <span>Active</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-6">Tag Management</h2>
              
              {certificatesLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Tag ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Issue Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {certificates?.map((certificate) => (
                        <tr key={certificate.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-neutral-800">
                            {certificate.certificateId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                            {certificate.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                            {certificate.course.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {new Date(certificate.issuedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="bg-secondary-green/10 text-secondary-green">
                              Active
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-6">Import Students</h2>
              <div className="max-w-2xl">
                <div className="mb-6">
                  <Label className="text-sm font-medium text-neutral-700 mb-2">CSV File Upload</Label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-3" />
                    <p className="text-neutral-600 mb-2">Drop your CSV file here or click to browse</p>
                    <p className="text-sm text-neutral-500 mb-3">
                      Supported format: name, email, course, completion_date
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csvUpload"
                    />
                    <Label htmlFor="csvUpload" className="cursor-pointer">
                      <Button type="button" className="bg-primary hover:bg-primary/90 text-white">
                        Choose File
                      </Button>
                    </Label>
                    {selectedFile && (
                      <p className="text-sm text-neutral-600 mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">CSV Template</h3>
                  <div className="bg-neutral-50 rounded-md p-4 font-mono text-sm text-neutral-700">
                    <div className="mb-2">name,email,course,completion_date</div>
                    <div className="text-neutral-500">John Doe,john@example.com,AI Design Sprint Bootcamp,2025-01-15</div>
                  </div>
                  <Button variant="ghost" className="mt-3 text-primary hover:text-primary/80">
                    Download Template
                  </Button>
                </div>
                
                <Button 
                  onClick={handleImport}
                  disabled={!selectedFile || importCsvMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {importCsvMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Process Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
