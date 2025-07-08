import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import linkedinIcon from "@assets/image_1752015253525.png";
import { CertificateWithDetails, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CertificateCardProps {
  certificate: CertificateWithDetails;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const blob = await api.downloadCertificate(certificate.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `certificate-${certificate.certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = api.generateLinkedInUrl(certificate);
    window.open(linkedInUrl, '_blank');
  };

  const getIconClass = (icon: string) => {
    return icon || "fas fa-certificate";
  };

  return (
    <Card className="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <i className={`${getIconClass(certificate.course.icon)} text-primary text-lg`} />
          </div>
          <Badge variant="secondary" className="bg-secondary-green/10 text-secondary-green">
            Completed
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
          {certificate.course.title}
        </h3>
        
        <p className="text-sm text-neutral-600 mb-4">
          {certificate.course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
          <span>
            Completed: {new Date(certificate.completionDate).toLocaleDateString()}
          </span>
          <span>{certificate.course.duration} hours</span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          <Button 
            variant="outline"
            className="border-neutral-200 hover:bg-neutral-50"
            onClick={handleLinkedInShare}
          >
            <img src={linkedinIcon} alt="LinkedIn" className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
