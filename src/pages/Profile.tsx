import { User, Mail, Phone, MapPin, Building, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm font-light text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  SA
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold text-foreground">Super Admin</h2>
              <p className="text-sm font-light text-muted-foreground">admin@company.com</p>
              <Badge variant="default" className="mt-2">
                <Shield className="mr-1 h-3 w-3" />
                Super Admin
              </Badge>
              <Button variant="outline" className="mt-4 w-full font-light">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-light text-muted-foreground">Full Name</p>
                  <p className="font-medium text-foreground">Super Admin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-light text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">admin@company.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-light text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">+1 (555) 000-0000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-light text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 sm:col-span-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-light text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">New York, NY, United States</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
