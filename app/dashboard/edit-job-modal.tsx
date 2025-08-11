"use client";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Calendar } from "@/app/components/ui/calendar";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AppliedJobTableData, updateAppliedJob, UpdateAppliedJobData } from "@/lib/appliedJobsService";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: AppliedJobTableData | null;
  onSuccess: () => void;
}

interface EditFormData {
  companyName: string;
  jobTitle: string;
  location: string;
  salary: number;
  status: "Submitted" | "Interview" | "Rejected" | "Accepted" | "Pending";
  link: string;
  dateApplied: Date | undefined;
}

export function EditJobModal({ isOpen, onClose, job, onSuccess }: EditJobModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    companyName: "",
    jobTitle: "",
    location: "",
    salary: 0,
    status: "Submitted",
    link: "",
    dateApplied: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      const parseDate = (dateString: string): Date => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? new Date() : date;
      };

      setFormData({
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        location: job.location,
        salary: job.salary,
        status: (job.status.charAt(0).toUpperCase() + job.status.slice(1)) as any,
        link: job.link,
        dateApplied: parseDate(job.dateApplied),
      });
      setErrors({});
    }
  }, [job]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.salary <= 0) {
      newErrors.salary = "Salary must be a positive number";
    }

    if (!formData.dateApplied) {
      newErrors.dateApplied = "Date applied is required";
    }

    if (!formData.link.trim()) {
      newErrors.link = "Job link is required";
    } else {
      try {
        new URL(formData.link);
      } catch {
        newErrors.link = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const updateData: UpdateAppliedJobData = {
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        location: formData.location,
        salary: formData.salary,
        status: formData.status,
        link: formData.link,
        dateApplied: formData.dateApplied!,
      };

      await updateAppliedJob(job.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    setFormData({
      companyName: "",
      jobTitle: "",
      location: "",
      salary: 0,
      status: "Submitted",
      link: "",
      dateApplied: undefined,
    });
    setErrors({});
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
          <DialogDescription>
            Update the details of your job application. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="Enter job title"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className={errors.jobTitle ? "border-red-500" : ""}
            />
            {errors.jobTitle && (
              <p className="text-sm text-red-500">{errors.jobTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              placeholder="Enter salary"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", parseFloat(e.target.value) || 0)}
              className={errors.salary ? "border-red-500" : ""}
            />
            {errors.salary && (
              <p className="text-sm text-red-500">{errors.salary}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateApplied">Date Applied</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateApplied && "text-muted-foreground",
                    errors.dateApplied && "border-red-500"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateApplied ? (
                    format(formData.dateApplied, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateApplied}
                  onSelect={(date) => handleInputChange("dateApplied", date)}
                  initialFocus
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </PopoverContent>
            </Popover>
            {errors.dateApplied && (
              <p className="text-sm text-red-500">{errors.dateApplied}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Job Link</Label>
            <Input
              id="link"
              placeholder="Enter job URL"
              value={formData.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
              className={errors.link ? "border-red-500" : ""}
            />
            {errors.link && (
              <p className="text-sm text-red-500">{errors.link}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}