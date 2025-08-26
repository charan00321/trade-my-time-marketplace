import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Users,
  TrendingUp,
  ArrowRight,
  Play
} from "lucide-react";

export default function Landing() {
  const stats = {
    totalTasks: "25,847",
    activeWorkers: "3,200+",
    averageRating: "4.9",
    averageTime: "< 2hrs"
  };

  const features = [
    { icon: Shield, title: "Payment Protection", desc: "Your payment is secured until task completion" },
    { icon: MapPin, title: "Local Workers", desc: "Find trusted helpers in your neighborhood" },
    { icon: Clock, title: "Quick Response", desc: "Get bids within minutes of posting" },
    { icon: Star, title: "Rated & Reviewed", desc: "All workers are background checked and rated" }
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="landing-page">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" data-testid="navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary" data-testid="logo">Trade My Time</h1>
              <div className="hidden md:flex items-center space-x-4 ml-10">
                <a href="#" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Browse Tasks</a>
                <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">How it Works</a>
                <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-primary text-primary hover:bg-blue-50" data-testid="button-become-worker">
                <Users className="w-4 h-4 mr-2" />
                Become a Worker
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-blue-700"
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="hero-title">
                Get Small Tasks Done by Local Helpers
              </h1>
              <p className="text-xl mb-8 text-blue-100" data-testid="hero-description">
                From grocery runs to document pickups, find trusted local workers to handle your everyday tasks at great prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-post-task"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Post a Task
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
                  data-testid="button-watch-demo"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch How it Works
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
                <h3 className="text-xl font-semibold mb-4">Quick Task Example</h3>
                <div className="space-y-3 text-blue-100">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Grocery shopping at Whole Foods</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>$20-30 budget range</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>5 bids received in 10 minutes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Task completed in 1 hour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2" data-testid="stat-total-tasks">
                {stats.totalTasks}
              </div>
              <div className="text-muted-foreground">Tasks Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2" data-testid="stat-active-workers">
                {stats.activeWorkers}
              </div>
              <div className="text-muted-foreground">Active Workers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500 mb-2" data-testid="stat-average-rating">
                {stats.averageRating}★
              </div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2" data-testid="stat-average-time">
                {stats.averageTime}
              </div>
              <div className="text-muted-foreground">Average Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Trade My Time?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make it safe, simple, and affordable to get help with everyday tasks
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow" data-testid={`feature-card-${index}`}>
                <CardContent className="pt-6">
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary py-16" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of customers who save time every day with Trade My Time
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
            >
              Get Started Now
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Trade My Time</h3>
              <p className="text-gray-400 mb-4">Connect with local helpers for all your small tasks. Safe, affordable, and reliable.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Post a Task</a></li>
                <li><a href="#" className="hover:text-white">Browse Workers</a></li>
                <li><a href="#" className="hover:text-white">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-white">Safety Tips</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Workers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Start Working</a></li>
                <li><a href="#" className="hover:text-white">Worker App</a></li>
                <li><a href="#" className="hover:text-white">Earning Tips</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-white">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Trade My Time. All rights reserved. Built with love for busy people.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
