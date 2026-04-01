import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

const DEFAULT_REASONS = [
  'I no longer want to receive these emails',
  'I never signed up for this mailing list',
  'The emails are not relevant to me',
  'I receive too many emails',
  'The content is not what I expected',
];

// This page works as a standalone public page — no auth required.
// It reads optional query params: ?email=...&campaign=...
const Unsubscribe = () => {
  const params = new URLSearchParams(window.location.search);
  const prefillEmail = params.get('email') || '';
  const campaignId = params.get('campaign') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleConfirm = () => {
    if (!email.trim() || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!selectedReason && !otherReason.trim()) return;

    // Store unsubscribe entry in localStorage so UnsubscribeAdmin can pick it up
    const reason = selectedReason === 'other' ? otherReason : selectedReason;
    const entry = {
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      reason,
      unsubAt: new Date().toISOString(),
      campaignId: campaignId || 'DIRECT',
      status: 'processing',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('unsub_requests') || '[]');
      existing.push(entry);
      localStorage.setItem('unsub_requests', JSON.stringify(existing));
    } catch {
      // If localStorage fails, still show confirmation
    }

    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-chart-1" />
            <h2 className="text-xl font-semibold text-foreground">Unsubscribe Request Received</h2>
            <p className="text-muted-foreground">
              We will remove you from our mailing list within <strong>48 hours</strong> (system processing time).
            </p>
            <p className="text-sm text-muted-foreground">
              If you continue to receive emails after this period, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
          <p className="text-sm text-muted-foreground">We're sorry to see you go. Please let us know why you'd like to unsubscribe.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="unsub-email">Your Email Address<span className="text-destructive">*</span></Label>
            <Input
              id="unsub-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              placeholder="you@example.com"
              className={`mt-1 ${emailError ? 'border-destructive' : ''}`}
            />
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </div>

          {campaignId && (
            <p className="text-xs text-muted-foreground">Campaign: <span className="font-mono">{campaignId}</span></p>
          )}

          <RadioGroup value={selectedReason} onValueChange={(v) => { setSelectedReason(v); setOtherReason(''); }}>
            {DEFAULT_REASONS.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="text-sm cursor-pointer">{reason}</Label>
              </div>
            ))}
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="other" id="other-reason" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="other-reason" className="text-sm cursor-pointer">Other</Label>
                {selectedReason === 'other' && (
                  <Textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please tell us why..."
                    className="min-h-[80px]"
                  />
                )}
              </div>
            </div>
          </RadioGroup>

          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'other' && !otherReason.trim()) || !email.trim()}
          >
            Confirm Unsubscribe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
