import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

const Unsubscribe = () => {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selectedReason && !otherReason.trim()) return;
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
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
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
          <p className="text-sm text-muted-foreground">We're sorry to see you go. Please let us know why you'd like to unsubscribe.</p>
        </CardHeader>
        <CardContent className="space-y-6">
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
            disabled={!selectedReason || (selectedReason === 'other' && !otherReason.trim())}
          >
            Confirm Unsubscribe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
