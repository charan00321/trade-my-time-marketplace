import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, ChevronDown, Menu, Users } from "lucide-react";
import type { User } from "@shared/schema";

interface NavigationProps {
  user: User;
  onPostTask?: () => void;
}

export function Navigation({ user, onPostTask }: NavigationProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const notificationCount = 3; // In a real app, this would come from state/API

  return (
    <nav 
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      data-testid="navigation-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary" data-testid="logo">Trade My Time</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a 
                  href="#" 
                  className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-browse-tasks"
                >
                  Browse Tasks
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-how-it-works"
                >
                  How it Works
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-pricing"
                >
                  Pricing
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-blue-50"
              data-testid="button-become-worker"
            >
              <Users className="w-4 h-4 mr-2" />
              Become a Worker
            </Button>
            
            {onPostTask && (
              <Button 
                onClick={onPostTask}
                className="bg-primary hover:bg-blue-700"
                data-testid="button-post-task-nav"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Task
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 relative"
                data-testid="button-notifications"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                    data-testid="notification-count"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
              
              {/* User Profile */}
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={handleLogout}
                data-testid="user-profile-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.profileImageUrl ?? undefined} 
                    alt={`${user.firstName} ${user.lastName}`} 
                  />
                  <AvatarFallback>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 hidden sm:block" data-testid="user-name">
                  {user.firstName} {user.lastName?.charAt(0)}.
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
