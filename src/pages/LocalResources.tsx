import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, Search, Phone, Globe, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_RESOURCES = [
  {
    name: "NIMHANS (National Institute of Mental Health)",
    type: "Hospital",
    location: "Bangalore, Karnataka",
    phone: "+91-80-2699-5000",
    website: "https://nimhans.ac.in/",
    services: ["Emergency Care", "Counseling", "Psychiatric Services"],
    hours: "24/7 Emergency",
    cost: "Government rates",
    verified: true
  },
  {
    name: "Vandrevala Foundation Helpline",
    type: "Helpline",
    location: "Pan India",
    phone: "+91-9999-666-555",
    website: "https://vandrevalafoundation.com/",
    services: ["Crisis Support", "Emotional Support"],
    hours: "24/7",
    cost: "Free",
    verified: true
  },
  {
    name: "iCall Psychosocial Helpline",
    type: "Helpline",
    location: "Mumbai (Pan India access)",
    phone: "+91-9152-987-821",
    email: "icall@tiss.edu",
    services: ["Psychological Support", "Crisis Intervention"],
    hours: "Monday-Saturday, 8 AM - 10 PM",
    cost: "Free",
    verified: true
  },
  {
    name: "Snehi (Crisis Helpline)",
    type: "Helpline", 
    location: "Delhi",
    phone: "+91-11-2416-4444",
    services: ["Suicide Prevention", "Crisis Support"],
    hours: "24/7",
    cost: "Free",
    verified: true
  },
  {
    name: "Manastha (Mental Health Support)",
    type: "Organization",
    location: "Hyderabad, Telangana",
    phone: "+91-8008-000-234",
    services: ["Counseling", "Support Groups", "Awareness Programs"],
    hours: "Monday-Friday, 9 AM - 6 PM",
    cost: "Subsidized rates",
    verified: true
  },
  {
    name: "Mind Matters Clinic",
    type: "Clinic",
    location: "Mumbai, Maharashtra",
    phone: "+91-22-2659-0000",
    services: ["Individual Therapy", "Family Counseling", "CBT"],
    hours: "Monday-Saturday, 9 AM - 8 PM",
    cost: "₹1,500-3,000 per session",
    verified: false
  }
];

const EMERGENCY_NUMBERS = [
  { name: "National Emergency", number: "112" },
  { name: "Police", number: "100" },
  { name: "Fire", number: "101" },
  { name: "Ambulance", number: "108" },
];

const LocalResources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState('');

  const resourceTypes = [...new Set(SAMPLE_RESOURCES.map(r => r.type))];

  const filteredResources = SAMPLE_RESOURCES.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === null || resource.type === selectedType;
    const matchesLocation = userLocation === '' || 
      resource.location.toLowerCase().includes(userLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const getLocationData = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, this would reverse geocode to get location name
          setUserLocation('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-healing-soft rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-healing" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Local Resources</h1>
                <p className="text-sm text-muted-foreground">Find nearby mental health support</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Emergency Section */}
        <Card className="shadow-soft mb-6 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Numbers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              If you're in immediate danger or having thoughts of self-harm, call emergency services immediately.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {EMERGENCY_NUMBERS.map((emergency, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-destructive">{emergency.number}</div>
                  <div className="text-xs text-muted-foreground">{emergency.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="shadow-soft mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder="Enter city or location"
                  className="pl-10"
                />
              </div>
              <Button onClick={getLocationData} variant="outline" className="gap-2">
                <MapPin className="w-4 h-4" />
                Use My Location
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                onClick={() => setSelectedType(null)}
                size="sm"
              >
                All Types
              </Button>
              {resourceTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  size="sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resources List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Mental Health Resources ({filteredResources.length})
          </h2>
          
          {filteredResources.map((resource, index) => (
            <Card key={index} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{resource.name}</h3>
                      {resource.verified && (
                        <Badge className="bg-healing text-healing-foreground">Verified</Badge>
                      )}
                      <Badge variant="outline">{resource.type}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {resource.location}
                      </div>
                      
                      {resource.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${resource.phone}`} className="hover:text-primary">
                            {resource.phone}
                          </a>
                        </div>
                      )}
                      
                      {resource.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={resource.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {resource.hours}
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Cost: {resource.cost}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm font-medium text-foreground mb-1">Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {resource.services.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 md:w-32">
                    {resource.phone && (
                      <Button asChild size="sm">
                        <a href={`tel:${resource.phone}`}>Call Now</a>
                      </Button>
                    )}
                    {resource.website && (
                      <Button asChild variant="outline" size="sm">
                        <a href={resource.website} target="_blank" rel="noopener noreferrer">
                          Visit Site
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredResources.length === 0 && (
            <Card className="shadow-soft">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No resources found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms or location filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="shadow-soft mt-8 border-healing/20 bg-healing-soft/10">
          <CardContent className="p-6">
            <h3 className="font-medium text-healing mb-2">Important Notes</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• This list is for informational purposes. Always verify current contact information.</p>
              <p>• In a mental health emergency, call emergency services immediately.</p>
              <p>• Resources are continuously updated. Suggest additions via our feedback form.</p>
              <p>• We do not endorse specific providers but aim to provide comprehensive listings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocalResources;