import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { type FirebaseCertificate } from '@/lib/firebase';

export default function VerifierFirebase() {
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState<FirebaseCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setIsLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch(`/api/verify-firebase/${certificateId.trim()}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setCertificate(data.certificate);
      } else {
        setError('Certificado no encontrado o inválido');
      }
    } catch (err) {
      setError('Error al verificar el certificado. Intenta de nuevo.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Verificador de Certificados
            </h1>
            <p className="text-gray-300">
              Ingresa el ID o Hash del certificado para verificar su autenticidad
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Verificar Certificado</CardTitle>
              <CardDescription className="text-gray-400">
                Busca por ID del certificado o por hash de verificación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Ingresa el ID o Hash del certificado"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>

              {error && (
                <Alert className="mt-4 bg-red-900 border-red-700">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {certificate && (
                <Alert className="mt-4 bg-green-900 border-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-200">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">✅ Certificado Válido</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong>Nombre:</strong> {certificate.nombre}
                        </div>
                        <div>
                          <strong>Curso:</strong> {certificate.curso}
                        </div>
                        <div>
                          <strong>Fecha:</strong> {certificate.fecha}
                        </div>
                        <div>
                          <strong>ID Certificado:</strong> {certificate.certificateId}
                        </div>
                        <div>
                          <strong>ID Firebase:</strong> {certificate.id}
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-green-800 rounded text-xs">
                        <strong>Hash:</strong> {certificate.hash}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Los certificados son verificados contra nuestra base de datos segura</p>
            <p>Puedes verificar usando el ID del certificado o el hash de verificación</p>
          </div>
        </div>
      </div>
    </div>
  );
}