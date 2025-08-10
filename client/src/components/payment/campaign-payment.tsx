import { useState } from "react";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import type { Campaign } from "@shared/schema";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  campaign: Campaign;
  clientSecret: string;
  amount: number;
  onPaymentSuccess: () => void;
}

const PaymentForm = ({ campaign, clientSecret, amount, onPaymentSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaign.id}/confirm-payment`, {
        paymentIntentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns', campaign.id] });
      onPaymentSuccess();
      toast({
        title: "Payment Successful",
        description: "Your campaign has been funded and activated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Confirmation Failed",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      confirmPaymentMutation.mutate(paymentIntent.id);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="text-blue-600" size={20} />
          <span className="font-medium text-blue-800">Secure Payment</span>
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and processed securely by Stripe.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Payment Details</h4>
        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || confirmPaymentMutation.isPending}
        className="w-full bg-fb-blue text-white hover:bg-blue-600"
        size="lg"
      >
        {isProcessing || confirmPaymentMutation.isPending ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2" size={16} />
            Pay ${amount.toFixed(2)} - Fund Campaign
          </>
        )}
      </Button>
    </form>
  );
};

interface CampaignPaymentProps {
  campaign: Campaign;
  onPaymentSuccess?: () => void;
}

export default function CampaignPayment({ campaign, onPaymentSuccess }: CampaignPaymentProps) {
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    amount: number;
    campaignName: string;
  } | null>(null);
  const { toast } = useToast();

  const { data: paymentStatus } = useQuery({
    queryKey: ['/api/campaigns', campaign.id, 'payment-status'],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaign.id}/payment-status`);
      return response.json();
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/campaigns/${campaign.id}/payment`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentData(data);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message?.includes("already paid") 
          ? "This campaign has already been paid for."
          : "Failed to set up payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const totalAmount = parseFloat(campaign.dailyBudget) * campaign.duration;

  if (campaign.paymentStatus === "paid") {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h3 className="font-semibold text-green-800">Campaign Funded</h3>
              <p className="text-sm text-green-700">
                This campaign has been successfully funded and is active.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="text-fb-blue" size={20} />
          <span>Campaign Funding</span>
          <Badge variant={campaign.paymentStatus === "pending" ? "secondary" : "destructive"}>
            {campaign.paymentStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Campaign Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Campaign:</span>
              <p className="font-medium">{campaign.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Daily Budget:</span>
              <p className="font-medium">${campaign.dailyBudget}</p>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="font-medium">{campaign.duration} days</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">Total Cost:</span>
              <div className="flex items-center space-x-1">
                <DollarSign className="text-fb-blue" size={16} />
                <p className="font-semibold text-fb-blue">{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {!paymentData ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <h5 className="font-medium text-blue-800">Payment Required</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    To activate your campaign, you need to fund it with the total budget amount.
                    This ensures your ads can run for the full duration.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => createPaymentMutation.mutate()}
              disabled={createPaymentMutation.isPending}
              className="w-full bg-fb-blue text-white hover:bg-blue-600"
              size="lg"
            >
              {createPaymentMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Setting up payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2" size={16} />
                  Fund Campaign - ${totalAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
            <PaymentForm
              campaign={campaign}
              clientSecret={paymentData.clientSecret}
              amount={paymentData.amount}
              onPaymentSuccess={() => {
                onPaymentSuccess?.();
                setPaymentData(null);
              }}
            />
          </Elements>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Payments are processed securely by Stripe</p>
          <p>• Your campaign will activate immediately after successful payment</p>
          <p>• Refunds are available according to our terms of service</p>
        </div>
      </CardContent>
    </Card>
  );
}