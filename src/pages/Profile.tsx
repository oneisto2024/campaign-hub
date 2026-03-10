import { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Shield, Pencil, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import HolidayBanner from '@/components/HolidayBanner';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  location: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Super Admin',
    email: 'admin@company.com',
    phone: '+1 (555) 000-0000',
    department: 'Administration',
    location: 'New York, NY, United States',
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const startEditing = () => { setDraft(profile); setIsEditing(true); };
  const cancelEditing = () => setIsEditing(false);
  const saveProfile = () => {
    setProfile(draft);
    setIsEditing(false);
    toast({ title: 'Profile updated successfully' });
  };

  const initials = profile.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const fields = [
    { icon: User, label: 'Full Name', key: 'fullName' as const },
    { icon: Mail, label: 'Email', key: 'email' as const },
    { icon: Phone, label: 'Phone', key: 'phone' as const },
    { icon: Building, label: 'Department', key: 'department' as const },
    { icon: MapPin, label: 'Location', key: 'location' as const, fullWidth: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm font-light text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <HolidayBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold text-foreground">{profile.fullName}</h2>
              <p className="text-sm font-light text-muted-foreground">{profile.email}</p>
              <Badge variant="default" className="mt-2">
                <Shield className="mr-1 h-3 w-3" />
                Super Admin
              </Badge>
              {!isEditing ? (
                <Button variant="outline" className="mt-4 w-full font-light" onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="mt-4 flex w-full gap-2">
                  <Button variant="default" className="flex-1 font-light" onClick={saveProfile}>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 font-light" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ icon: Icon, label, key, fullWidth }) => (
                <div key={key} className={`flex items-center gap-3 rounded-lg border border-border p-4 ${fullWidth ? 'sm:col-span-2' : ''}`}>
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-light text-muted-foreground">{label}</p>
                    {isEditing ? (
                      <Input
                        value={draft[key]}
                        onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <p className="font-medium text-foreground">{profile[key]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
