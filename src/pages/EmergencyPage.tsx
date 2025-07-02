
import React, { useState } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, Heart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useEmergency } from '@/contexts/EmergencyContext';
import EmergencyContact from '@/components/EmergencyContact';
import { toast } from 'sonner';

const EmergencyPage = () => {
  const { contacts } = useEmergency();
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });
  const { addContact } = useEmergency();

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please fill in name and phone number');
      return;
    }

    addContact(newContact);
    setNewContact({ name: '', phone: '', relationship: '' });
    toast.success('Emergency contact added');
  };

  const callEmergencyServices = () => {
    // In a real app, this would initiate a call to local emergency services
    toast.success('Calling emergency services...');
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, this would share location with emergency services
          toast.success(`Location shared: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => {
          toast.error('Unable to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-20 px-4">
      <AnimatedContainer className="mb-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-emergency mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Emergency Services</h1>
          <p className="text-muted-foreground">
            Quick access to emergency services and your emergency contacts
          </p>
        </div>
      </AnimatedContainer>

      {/* Quick Emergency Actions */}
      <AnimatedContainer animation="fade-in" delay={100} className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2 text-emergency" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={callEmergencyServices}
              className="w-full flex items-center justify-center bg-emergency hover:bg-emergency/90 text-white py-4 px-6 rounded-lg font-medium transition-colors"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Emergency Services
            </button>
            
            <button
              onClick={shareLocation}
              className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Share My Location
            </button>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Emergency Contacts */}
      <AnimatedContainer animation="fade-in" delay={200} className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <EmergencyContact
                  key={contact.id}
                  name={contact.name}
                  phone={contact.phone}
                  relationship={contact.relationship}
                  onCall={() => toast.success(`Calling ${contact.name}...`)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Emergency Contacts</p>
                <p className="text-sm">Add trusted contacts for quick access during emergencies</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Add New Contact */}
      <AnimatedContainer animation="fade-in" delay={300}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter contact name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Relationship</label>
              <input
                type="text"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Spouse, Doctor, Family"
              />
            </div>
            
            <button
              onClick={handleAddContact}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md font-medium transition-colors"
            >
              Add Contact
            </button>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default EmergencyPage;
