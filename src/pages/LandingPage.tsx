
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Activity, MessageCircle } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedContainer animation="fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              RoadSafe
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Your AI-powered companion for road emergency situations
            </p>
          </AnimatedContainer>

          <AnimatedContainer animation="scale-in" delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="text-lg px-8 py-6 h-auto"
              >
                Log In
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/signup')}
                className="text-lg px-8 py-6 h-auto"
              >
                Sign Up
              </Button>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Key Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-blue-500" />}
              title="Emergency Assistance"
              description="Get immediate help during road emergencies with just one tap"
            />
            <FeatureCard
              icon={<Activity className="h-10 w-10 text-purple-500" />}
              title="Accident Reporting"
              description="Report accidents and get AI-powered assistance for documentation"
            />
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-pink-500" />}
              title="First Aid Guidance"
              description="Access AI-powered first aid instructions in critical situations"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who rely on RoadSafe for emergency assistance
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="text-lg px-8"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground">
        <p>© 2025 RoadSafe. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Feature card component for the landing page
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <AnimatedContainer animation="fade-in" className="bg-background p-6 rounded-lg shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </AnimatedContainer>
  );
};

export default LandingPage;
