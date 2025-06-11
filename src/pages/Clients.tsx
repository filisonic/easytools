
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Building,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';

const Clients = () => {
  const clients = [
    {
      id: '1',
      company: 'TechCorp Inc.',
      contact: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      activeJobs: 3,
      totalPlacements: 12,
      status: 'active'
    },
    {
      id: '2',
      company: 'StartupXYZ',
      contact: 'Sarah Johnson',
      email: 'sarah@startupxyz.com',
      phone: '+1 (555) 987-6543',
      location: 'Austin, TX',
      activeJobs: 1,
      totalPlacements: 5,
      status: 'active'
    },
    {
      id: '3',
      company: 'CloudTech Solutions',
      contact: 'Mike Davis',
      email: 'mike@cloudtech.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      activeJobs: 0,
      totalPlacements: 8,
      status: 'inactive'
    }
  ];

  return (
    <PageLayout title="Clients">
      <div className="space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Clients</h2>
            <p className="text-muted-foreground">Manage your client relationships and contracts</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by company name or contact..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{client.company}</CardTitle>
                      <CardDescription>{client.contact}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {client.location}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{client.activeJobs}</div>
                    <div className="text-xs text-muted-foreground">Active Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{client.totalPlacements}</div>
                    <div className="text-xs text-muted-foreground">Total Placements</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    View Jobs
                  </Button>
                  <Button size="sm">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Clients;
