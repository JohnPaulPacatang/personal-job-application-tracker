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
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { AppliedJobTableData, updateAppliedJob, UpdateAppliedJobData } from "@/lib/appliedJobsService";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: AppliedJobTableData | null;
  onSuccess: () => void;
}

export function EditJobModal({ isOpen, onClose, job, onSuccess }: EditJobModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    location: "",
    salary: 0,
    status: "Submitted" as "Submitted" | "Interview" | "Rejected" | "Accepted" | "Pending",
    link: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form values when job changes
  useEffect(() => {
    if (job) {
      setFormData({
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        location: job.location,
        salary: job.salary,
        status: (job.status.charAt(0).toUpperCase() + job.status.slice(1)) as any,
        link: job.link,
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
    // Clear error when user starts typing
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