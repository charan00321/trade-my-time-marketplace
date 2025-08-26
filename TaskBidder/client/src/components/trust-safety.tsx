import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  CheckCircle, 
  Upload, 
  Camera,
  AlertTriangle,
  Star,
  Clock,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  IdCard,
  Award
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TrustSafetyProps {
  userId: string;
}

interface Verification {
  id: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export function TrustSafetyPanel({ userId }: TrustSafetyProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'verify' | 'safety'>('overview');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch user verifications
  const { data: verifications } = useQuery({
    queryKey: ['/api/verifications', userId],
  });

  const { data: userProfile } = useQuery({
    queryKey: ['/api/users/profile', userId],
  });

  // Submit verification mutation
  const submitVerificationMutation = useMutation({
    mutationFn: async (data: { type: string; documents: string[]; notes?: string }) => {
      const response = await apiRequest("POST", "/api/verifications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Submitted",
        description: "Your verification has been submitted for review. You'll be notified within 24-48 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verifications'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock verification data
  const mockVerifications: Verification[] = [
    {
      id: '1',
      type: 'identity',
      status: 'verified',
      submittedAt: '2024-01-15T10:00:00Z',
      verifiedAt: '2024-01-16T09:30:00Z',
      expiresAt: '2025-01-16T09:30:00Z'
    },
    {
      id: '2',
      type: 'background_check',
      status: 'pending',
      submittedAt: '2024-01-20T14:00:00Z'
    },
    {
      id: '3',
      type: 'skill_test',
      status: 'rejected',
      submittedAt: '2024-01-18T11:00:00Z'
    }
  ];

  const verificationTypes = [
    {
      id: 'identity',
      name: 'Identity Verification',
      description: 'Upload government-issued ID for identity confirmation',
      icon: <IdCard className="w-5 h-5" />,
      required: true,
      documents: ['Government ID', 'Passport', 'Driver\'s License'],
      status: mockVerifications.find(v => v.type === 'identity')?.status || 'not_started'
    },
    {
      id: 'background_check',
      name: 'Background Check',
      description: 'Professional background verification for enhanced trust',
      icon: <Shield className="w-5 h-5" />,
      required: false,
      documents: ['Employment History', 'References'],
      status: mockVerifications.find(v => v.type === 'background_check')?.status || 'not_started'
    },
    {
      id: 'skill_test',
      name: 'Skill Assessment',
      description: 'Demonstrate your expertise in specific task categories',
      icon: <Award className="w-5 h-5" />,
      required: false,
      documents: ['Portfolio', 'Certificates', 'Work Samples'],
      status: mockVerifications.find(v => v.type === 'skill_test')?.status || 'not_started'
    },
    {
      id: 'address',
      name: 'Address Verification',
      description: 'Confirm your current residential address',
      icon: <MapPin className="w-5 h-5" />,
      required: false,
      documents: ['Utility Bill', 'Bank Statement', 'Lease Agreement'],
      status: 'not_started'
    }
  ];

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      // Mock photo upload - in real app would upload to cloud storage
      setTimeout(() => {
        setUploadingPhoto(false);
        toast({
          title: "Photo Uploaded",
          description: "Your photo has been uploaded successfully.",
        });
      }, 2000);
    } catch (error) {
      setUploadingPhoto(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="trust-safety-panel">
      
      {/* Trust Score Overview */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-700 text-white" data-testid="trust-score-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Trust Score: 85/100</h3>
              <p className="text-green-100">High trust level • Verified worker</p>
              <div className="flex items-center space-x-4 mt-4 text-sm">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Identity Verified
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  4.8 Rating
                </span>
                <span className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  47 Tasks Done
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-10 h-10" />
              </div>
              <Badge className="bg-green-500 text-white">Trusted</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: Shield },
          { key: 'verify', label: 'Verification', icon: CheckCircle },
          { key: 'safety', label: 'Safety Tips', icon: AlertTriangle }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === key 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid={`tab-${key}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6" data-testid="overview-tab">
          
          {/* Verification Status Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {verificationTypes.map((verification) => (
              <Card key={verification.id} data-testid={`verification-${verification.id}`}>
                <CardContent className="p-4 text-center">
                  <div className="mb-3">{verification.icon}</div>
                  <h4 className="font-semibold text-sm mb-2">{verification.name}</h4>
                  <Badge className={getStatusColor(verification.status)}>
                    {getStatusIcon(verification.status)}
                    <span className="ml-1 capitalize">{verification.status.replace('_', ' ')}</span>
                  </Badge>
                  {verification.required && verification.status === 'not_started' && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card data-testid="recent-activity-card">
            <CardHeader>
              <CardTitle>Recent Verification Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVerifications.map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(verification.status)}
                      <div>
                        <p className="font-medium text-sm capitalize">{verification.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(verification.status)}>
                      {verification.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trust Building Tips */}
          <Card data-testid="trust-tips-card">
            <CardHeader>
              <CardTitle>Build More Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { tip: 'Complete background check verification', points: '+15 trust points', icon: '🔍' },
                  { tip: 'Upload a professional profile photo', points: '+5 trust points', icon: '📸' },
                  { tip: 'Get 5 more 5-star reviews', points: '+10 trust points', icon: '⭐' },
                  { tip: 'Complete skill assessment tests', points: '+12 trust points', icon: '🎯' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.tip}</span>
                    </div>
                    <Badge variant="outline">{item.points}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="space-y-6" data-testid="verify-tab">
          
          {/* Verification Types */}
          {verificationTypes.map((verification) => (
            <Card key={verification.id} data-testid={`verify-${verification.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {verification.icon}
                    <span className="ml-2">{verification.name}</span>
                    {verification.required && (
                      <Badge variant="destructive" className="ml-2">Required</Badge>
                    )}
                  </CardTitle>
                  <Badge className={getStatusColor(verification.status)}>
                    {getStatusIcon(verification.status)}
                    <span className="ml-1 capitalize">{verification.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{verification.description}</p>
                
                {verification.status === 'not_started' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Required Documents:</label>
                      <div className="flex flex-wrap gap-2">
                        {verification.documents.map((doc, index) => (
                          <Badge key={index} variant="outline">{doc}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Upload Documents</label>
                        <Input type="file" accept="image/*,.pdf" multiple />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
                        <Textarea placeholder="Any additional information..." rows={3} />
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => submitVerificationMutation.mutate({
                          type: verification.id,
                          documents: ['mock-doc-url'],
                          notes: 'Submitted for verification'
                        })}
                        disabled={submitVerificationMutation.isPending}
                        data-testid={`button-submit-${verification.id}`}
                      >
                        {submitVerificationMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
                      </Button>
                    </div>
                  </div>
                )}

                {verification.status === 'pending' && (
                  <div className="text-center py-6">
                    <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Verification in Progress</h4>
                    <p className="text-muted-foreground">Your documents are being reviewed. You'll be notified within 24-48 hours.</p>
                  </div>
                )}

                {verification.status === 'verified' && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2 text-green-700">Verification Complete</h4>
                    <p className="text-muted-foreground">This verification is active and will expire on {new Date().toLocaleDateString()}.</p>
                  </div>
                )}

                {verification.status === 'rejected' && (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2 text-red-700">Verification Rejected</h4>
                    <p className="text-muted-foreground mb-4">Please review the requirements and submit again with correct documentation.</p>
                    <Button variant="outline" data-testid={`button-resubmit-${verification.id}`}>
                      Submit Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-6" data-testid="safety-tab">
          
          {/* Safety Guidelines */}
          <Card data-testid="safety-guidelines-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Meet in Public Places',
                    description: 'For pickup/delivery tasks, meet in well-lit, public locations when possible.',
                    icon: '🏪'
                  },
                  {
                    title: 'Verify Task Details',
                    description: 'Always confirm task requirements and location before starting work.',
                    icon: '✅'
                  },
                  {
                    title: 'Use Platform Communication',
                    description: 'Keep all communication within the platform for your safety and record keeping.',
                    icon: '💬'
                  },
                  {
                    title: 'Trust Your Instincts',
                    description: 'If something feels wrong, don\'t hesitate to cancel and report the issue.',
                    icon: '🚨'
                  },
                  {
                    title: 'Photo Documentation',
                    description: 'Take photos of completed work as proof and for quality assurance.',
                    icon: '📸'
                  }
                ].map((guideline, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <span className="text-2xl">{guideline.icon}</span>
                    <div>
                      <h4 className="font-semibold mb-1">{guideline.title}</h4>
                      <p className="text-muted-foreground text-sm">{guideline.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card data-testid="emergency-contacts-card">
            <CardHeader>
              <CardTitle>Emergency & Support Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-800">Emergency</p>
                      <p className="text-sm text-red-600">Life-threatening situations</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">Call 911</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-800">Platform Support</p>
                      <p className="text-sm text-blue-600">Task issues & platform help</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-contact-support">
                    Contact Us
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-800">Report Issue</p>
                      <p className="text-sm text-yellow-600">Safety concerns & inappropriate behavior</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-report-issue">
                    Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}