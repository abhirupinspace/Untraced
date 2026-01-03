"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: Array<{
    name: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
    type?: "text" | "textarea";
  }>;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  submitLabel?: string;
}

export function EditDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = "Save Changes",
}: EditDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset values when dialog opens with new default values
  useEffect(() => {
    if (open) {
      const initialValues: Record<string, string> = {};
      fields.forEach((field) => {
        initialValues[field.name] = field.defaultValue || "";
      });
      setValues(initialValues);
    }
  }, [open, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Edit submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = fields.every(
    (field) => !field.required || values[field.name]?.trim()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-1">{description}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-normal text-muted-foreground mb-1.5">
                {field.label}
                {field.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm font-light bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none"
                  disabled={isLoading}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.name] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 text-sm font-light bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
              )}
            </div>
          ))}
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !isValid}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
