
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User, Phone, Heart, Shield, Bell, LogOut, Moon, Sun, Edit2, Save, X } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import EmergencyContact from '@/components/EmergencyContact';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';
import { Switch } from '@/components/ui/switch';

interface ContactFormData {
  name: string;
  phone: string;
  relationship: string;
}

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { contacts, addContact, removeContact } = useEmergency();
  const { theme, toggleTheme } = useTheme();
  
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    phone: '',
    relationship: ''
  });
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddContact = () => {
    // Simple validation
    if (!contactForm.name || !contactForm.phone) {
      toast.error('Name and phone number are required');
      return;
    }
    
    addContact(contactForm);
    setContactForm({ name: '', phone: '', relationship: '' });
    setIsAddingContact(false);
    toast.success('Emergency contact added successfully');
  };
  
  const handleSaveProfile = () => {
    // Simple validation
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    // In a real app, this would update the user profile via API
    // For now, we'll just update localStorage and show success
    const updatedUser = {
      ...user,
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim()
    };
    
    localStorage.setItem('smartCrashUser', JSON.stringify(updatedUser));
    setIsEditingProfile(false);
    toast.success('Profile updated successfully');
    
    // Force a page refresh to update the user context
    window.location.reload();
  };
  
  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditingProfile(false);
  };
  
  const handleDeleteContact = (id: string) => {
    removeContact(id);
    toast.success('Emergency contact removed');
  };
  
  const handleCallContact = (phone: string) => {
    // In a real app, this would initiate a phone call
    toast.info(`Calling ${phone}`);
  };
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen pt-6 pb-20 px-4">
      {/* Header */}
      <AnimatedContainer className="mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Profile & Settings</h1>
        </div>
      </AnimatedContainer>
      
      {/* User info */}
      <AnimatedContainer animation="fade-in" delay={100} className="mb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4 flex-1">
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="profileName" className="text-sm font-medium">
                        Name
                      </label>
                      <input
                        type="text"
                        id="profileName"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileInputChange}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="profilePhone" className="text-sm font-medium">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="profilePhone"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileInputChange}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-medium">{user?.name || 'User'}</h2>
                    <p className="text-muted-foreground">{user?.email || 'No email'}</p>
                    {user?.phone && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditingProfile ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Emergency contacts */}
      <AnimatedContainer animation="fade-in" delay={200} className="mb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Emergency Contacts</h2>
            <button
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          {isAddingContact && (
            <AnimatedContainer animation="scale-in" className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Add New Contact</h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary border border-input"
                      placeholder="Contact name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary border border-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="relationship" className="text-sm font-medium">
                    Relationship
                  </label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      <Heart className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="relationship"
                      name="relationship"
                      value={contactForm.relationship}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary border border-input"
                      placeholder="Family member, doctor, etc."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1 py-2 rounded-md border border-input hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="flex-1 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </AnimatedContainer>
          )}
          
          <div className="space-y-3">
            {contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <AnimatedContainer
                  key={contact.id}
                  animation="fade-in"
                  delay={300 + (index * 100)}
                >
                  <EmergencyContact
                    name={contact.name}
                    phone={contact.phone}
                    relationship={contact.relationship}
                    onDelete={() => handleDeleteContact(contact.id)}
                    onCall={() => handleCallContact(contact.phone)}
                  />
                </AnimatedContainer>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {!isAddingContact && (
                  <p>No emergency contacts added yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Settings */}
      <AnimatedContainer animation="fade-in" delay={300} className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        
        <div className="space-y-2">
          {/* Theme toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 mr-3 text-primary" />
              ) : (
                <Sun className="h-5 w-5 mr-3 text-primary" />
              )}
              <span>Dark Mode</span>
            </div>
            <Switch 
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-primary" />
              <span>Privacy Settings</span>
            </div>
            <ArrowLeft className="h-4 w-4 transform rotate-180" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-primary" />
              <span>Notifications</span>
            </div>
            <ArrowLeft className="h-4 w-4 transform rotate-180" />
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <div className="flex items-center">
              <LogOut className="h-5 w-5 mr-3" />
              <span>Log Out</span>
            </div>
          </button>
        </div>
      </AnimatedContainer>
      
      <BottomNavigation />
    </div>
  );
};

export default ProfileScreen;
