import { useQuery } from "@tanstack/react-query";
import { Tag, Clock, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { CertificateCard } from "@/components/ui/certificate-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function GraduateDashboard() {
  const { toast } = useToast();
  
  // Mock user ID - in real app this would come from auth context
  // Using user ID 2 for the sample graduate user (John Doe)
  const userId = 2;

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ['/api/certificates/user', userId],
    queryFn: () => api.getUserCertificates(userId),
  });

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" className="mt-20" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load certificates. Please try again.</p>
        </div>
      </main>
    );
  }

  const totalCertificates = certificates?.length || 0;
  const totalHours = certificates?.reduce((sum, cert) => sum + cert.course.duration, 0) || 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">My Certificates</h1>
        <p className="text-neutral-600">Manage and download your course certificates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Certificates"
          value={totalCertificates}
          icon={Tag}
          iconColor="text-primary"
          bgColor="bg-primary/10"
        />
        <StatsCard
          title="Hours Completed"
          value={totalHours}
          icon={Clock}
          iconColor="text-secondary-green"
          bgColor="bg-secondary-green/10"
        />
        <StatsCard
          title="Skill Level"
          value="Advanced"
          icon={Trophy}
          iconColor="text-accent-orange"
          bgColor="bg-accent-orange/10"
        />
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {certificates?.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
        
        {certificates?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No certificates yet</h3>
            <p className="text-neutral-600">Complete a course to earn your first certificate!</p>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                className="mt-2 border-neutral-200"
                defaultValue="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                className="mt-2 border-neutral-200"
                defaultValue="john.doe@example.com"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleUpdateProfile}
            >
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
