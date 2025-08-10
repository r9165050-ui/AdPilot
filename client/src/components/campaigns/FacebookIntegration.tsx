import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Facebook, ExternalLink, CheckCircle, AlertTriangle, Users, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FacebookUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  adAccounts: FacebookAdAccount[];
}

interface FacebookAdAccount {
  id: string;
  name: string;
  accountStatus: number;
  currency: string;
  timezone: string;
}

interface FacebookIntegrationProps {
  campaignId: string;
  campaignName: string;
}

export function FacebookIntegration({ campaignId, campaignName }: FacebookIntegrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [facebookUser, setFacebookUser] = useState<FacebookUser | null>(null);
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');

  const connectToFacebookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/facebook');
      if (!response.ok) throw new Error('Failed to connect');
      return response.json();
    },
    onSuccess: (data: { authUrl: string; state: string }) => {
      // Open Facebook login in a popup
      const popup = window.open(
        data.authUrl,
        'facebook-login',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for popup messages
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'FACEBOOK_AUTH_SUCCESS') {
          setFacebookUser(event.data.user);
          popup?.close();
          toast({
            title: "Connected to Facebook",
            description: "Successfully connected to your Facebook account."
          });
        } else if (event.data.type === 'FACEBOOK_AUTH_ERROR') {
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect to Facebook.",
            variant: "destructive"
          });
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Clean up listener when popup closes
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initiate Facebook connection.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  });

  const publishToFacebookMutation = useMutation({
    mutationFn: async () => {
      if (!facebookUser || !selectedAdAccount) {
        throw new Error("Please select an ad account");
      }

      const response = await fetch(`/api/campaigns/${campaignId}/publish-to-facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: facebookUser.accessToken,
          adAccountId: selectedAdAccount
        })
      });
      if (!response.ok) throw new Error('Failed to publish');
      return response.json();
    },
    onSuccess: (data: { facebookCampaignId: string; status: string; message: string }) => {
      setPublishStatus('success');
      toast({
        title: "Campaign Published",
        description: data.message
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    },
    onError: (error: any) => {
      setPublishStatus('error');
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish campaign to Facebook.",
        variant: "destructive"
      });
    }
  });

  const handleConnectToFacebook = async () => {
    setIsConnecting(true);
    await connectToFacebookMutation.mutateAsync();
  };

  const handlePublishToFacebook = async () => {
    setPublishStatus('publishing');
    await publishToFacebookMutation.mutateAsync();
  };

  const getAccountStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <Badge variant="default">Active</Badge>;
      case 2: return <Badge variant="destructive">Disabled</Badge>;
      case 3: return <Badge variant="secondary">Unsettled</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card data-testid="facebook-integration">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5" />
          Facebook Integration
        </CardTitle>
        <CardDescription>
          Connect your Facebook account to publish campaigns directly to Facebook Ads Manager
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!facebookUser ? (
          // Facebook Connection Step
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connect to Facebook</h3>
              <p className="text-muted-foreground">
                Link your Facebook account to publish "{campaignName}" directly to Facebook Ads
              </p>
            </div>
            <Button 
              onClick={handleConnectToFacebook}
              disabled={isConnecting || connectToFacebookMutation.isPending}
              size="lg"
              className="bg-[#1877f2] hover:bg-[#166fe5] text-white"
              data-testid="button-connect-facebook"
            >
              <Facebook className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect with Facebook'}
            </Button>
          </div>
        ) : (
          // Connected State
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <div className="font-medium">{facebookUser.name}</div>
                <div className="text-sm text-muted-foreground">{facebookUser.email}</div>
              </div>
              <Badge variant="outline">Connected</Badge>
            </div>

            <Separator />

            {/* Ad Account Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select Ad Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose which Facebook ad account to publish your campaign to
                </p>
                <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                  <SelectTrigger data-testid="select-ad-account">
                    <SelectValue placeholder="Select an ad account" />
                  </SelectTrigger>
                  <SelectContent>
                    {facebookUser.adAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {account.currency.toUpperCase()} • {account.timezone}
                            </div>
                          </div>
                          {getAccountStatusBadge(account.accountStatus)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {facebookUser.adAccounts.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No ad accounts found. Make sure you have access to Facebook ad accounts.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Publishing */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Publish Campaign</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create a new campaign in Facebook Ads Manager with your current settings
                </p>
              </div>

              {publishStatus === 'success' ? (
                <Alert data-testid="publish-success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Campaign successfully published to Facebook! You can view and manage it in Facebook Ads Manager.
                  </AlertDescription>
                </Alert>
              ) : publishStatus === 'error' ? (
                <Alert variant="destructive" data-testid="publish-error">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to publish campaign. Please check your Facebook account permissions and try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  onClick={handlePublishToFacebook}
                  disabled={!selectedAdAccount || publishStatus === 'publishing' || publishToFacebookMutation.isPending}
                  size="lg"
                  className="w-full"
                  data-testid="button-publish-facebook"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {publishStatus === 'publishing' ? 'Publishing...' : 'Publish to Facebook'}
                </Button>
              )}
            </div>

            {/* Campaign Info */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Campaign Details</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{campaignName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span>Facebook & Instagram</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}