import { useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Search, CheckCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api, CertificateWithDetails } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Verifier() {
  const { certificateId: urlCertificateId } = useParams();
  const [certificateId, setCertificateId] = useState(urlCertificateId || "");
  const [verificationResult, setVerificationResult] = useState<CertificateWithDetails | null>(null);
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: api.verifyCertificate,
    onSuccess: (data) => {
      setVerificationResult(data);
      toast({
        title: "Certificate Verified",
        description: "This certificate is valid and authentic.",
      });
    },
    onError: (error) => {
      setVerificationResult(null);
      toast({
        title: "Verification Failed",
        description: "Certificate not found or invalid.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!certificateId.trim()) {
      toast({
        title: "Certificate ID Required",
        description: "Please enter a certificate ID to verify.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(certificateId.trim());
  };

  // Auto-verify if certificate ID is in URL
  useState(() => {
    if (urlCertificateId) {
      verifyMutation.mutate(urlCertificateId);
    }
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Search className="text-primary text-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Certificate Verification</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Enter a certificate ID, hash, or Firebase ID to verify its authenticity and view details
        </p>
      </div>

      {/* Verification Form */}
      <Card className="shadow-sm border border-neutral-200 mb-8">
        <CardContent className="p-8">
          <div className="max-w-md mx-auto">
            <Label htmlFor="certificateId" className="text-sm font-medium text-neutral-700 mb-3">
              Certificate ID, Hash, or Firebase ID
            </Label>
            <div className="flex space-x-3">
              <Input
                id="certificateId"
                type="text"
                placeholder="Enter certificate ID, hash, or Firebase ID"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="flex-1 border-neutral-200 text-center font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {verifyMutation.isPending ? <LoadingSpinner size="sm" /> : "Verify"}
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-center">
              You can verify using certificate ID, SHA-256 hash, or Firebase ID
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className="shadow-sm border border-neutral-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-secondary-green/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-secondary-green text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-800">Certificate Verified</h2>
              <p className="text-neutral-600 mt-2">This certificate is valid and authentic</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-primary/5 to-secondary-green/5 rounded-lg p-6 border border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <i className="fas fa-graduation-cap text-primary text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{verificationResult.user.name}</h3>
                      <p className="text-sm text-neutral-600">Certificate Holder</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">Certificate ID</p>
                    <p className="font-mono text-sm text-neutral-800">{verificationResult.certificateId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Course Information</h4>
                    <p className="text-lg font-semibold text-neutral-800">{verificationResult.course.title}</p>
                    <p className="text-sm text-neutral-600 mt-1">{verificationResult.course.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Certification Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Issue Date:</span>
                        <span className="text-sm text-neutral-800">
                          {new Date(verificationResult.completionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Duration:</span>
                        <span className="text-sm text-neutral-800">{verificationResult.course.duration} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Issued By:</span>
                        <span className="text-sm text-neutral-800">WeSpark</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-secondary-green">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified by WeSpark Certificate Authority</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
