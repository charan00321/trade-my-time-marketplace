import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, MapPin, Camera, Shield } from "lucide-react";

const taskFormSchema = insertTaskSchema.extend({
  budgetMin: z.coerce.number().min(5, "Minimum budget must be at least $5"),
  budgetMax: z.coerce.number().min(5, "Maximum budget must be at least $5"),
  photos: z.array(z.string()).optional(),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskForm({ onClose, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "grocery_shopping",
      location: "",
      budgetMin: 15,
      budgetMax: 30,
      urgency: "today",
      photos: [],
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      toast({
        title: "Task Posted Successfully!",
        description: "Your task is now live and you'll start receiving bids soon.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate({
      ...data,
      photos,
    });
  };

  const handlePhotoUpload = () => {
    // In a real app, this would handle file upload to cloud storage
    toast({
      title: "Photo Upload",
      description: "Photo upload functionality would be implemented here with cloud storage.",
    });
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // In a real app, this would reverse geocode to get address
        form.setValue("location", `${position.coords.latitude}, ${position.coords.longitude}`);
        toast({
          title: "Location Set",
          description: "Your current location has been set.",
        });
      });
    } else {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="task-form-modal"
    >
      <Card 
        className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-2xl">Post a New Task</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-form">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="grocery_shopping">Grocery Shopping</SelectItem>
                            <SelectItem value="document_pickup">Document Pickup</SelectItem>
                            <SelectItem value="queue_standing">Queue Standing</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Grocery Shopping at Whole Foods"
                            data-testid="input-title"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you need done in detail..."
                            className="h-32"
                            data-testid="textarea-description"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              placeholder="Enter address or use current location"
                              className="pl-10"
                              data-testid="input-location"
                              {...field} 
                            />
                          </FormControl>
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Button 
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1"
                            onClick={useCurrentLocation}
                            data-testid="button-use-location"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <FormLabel>Budget Range</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <FormField
                        control={form.control}
                        name="budgetMin"
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="Min"
                                  className="pl-8"
                                  data-testid="input-budget-min"
                                  {...field}
                                />
                              </FormControl>
                              <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budgetMax"
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="Max"
                                  className="pl-8"
                                  data-testid="input-budget-max"
                                  {...field}
                                />
                              </FormControl>
                              <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Similar tasks average $15-25</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>When do you need this done?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-urgency">
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asap">Within 2 hours (+25% priority fee)</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="3_days">Within 3 days</SelectItem>
                            <SelectItem value="week">This week</SelectItem>
                            <SelectItem value="flexible">Flexible timing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Add Photos (Optional)</FormLabel>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer mt-2"
                      onClick={handlePhotoUpload}
                      data-testid="photo-upload-area"
                    >
                      <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Click to add photos or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">Help workers understand your task better</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Your payment is protected until task completion</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending}
                    className="bg-primary hover:bg-blue-700"
                    data-testid="button-submit-task"
                  >
                    {createTaskMutation.isPending ? "Posting..." : "Post Task & Get Bids"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
