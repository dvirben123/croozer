import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
}

export function ContactFormDialog({
  open,
  onOpenChange,
  source = "contact_form",
}: ContactFormDialogProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setFormData({
      fullName: "",
      businessName: "",
      phone: "",
      email: "",
      message: "",
    });
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.businessName,
          message: formData.message,
          source: source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSubmitStatus("success");

      // Close dialog after 2 seconds and reset form
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "שגיאה בשליחת הטופס"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg mx-auto bg-card text-card-foreground border-border dark"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-card-foreground">
            {submitStatus === "success" ? "✅ הטופס נשלח בהצלחה!" : "כתבו לנו"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {submitStatus === "success"
              ? "תודה על פנייתכם! נחזור אליכם בהקדם האפשרי."
              : "מלאו את הפרטים ונחזור אליכם תוך 24 שעות עם הדגמה אישית"}
          </DialogDescription>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-card-foreground mb-2">הפנייה נשלחה בהצלחה!</p>
            <p className="text-muted-foreground text-sm">
              נחזור אליכם תוך 24 שעות
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-muted-foreground mb-2 text-right"
              >
                שם מלא *
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="bg-input border-border text-foreground text-right"
                placeholder="השם המלא שלכם"
                dir="rtl"
              />
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="block text-muted-foreground mb-2 text-right"
              >
                שם העסק *
              </label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="bg-input border-border text-foreground text-right"
                placeholder="שם בית העסק שלכם"
                dir="rtl"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-muted-foreground mb-2 text-right"
              >
                מספר טלפון *
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="bg-input border-border text-foreground text-right"
                placeholder="050-1234567"
                dir="rtl"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-muted-foreground mb-2 text-right"
              >
                כתובת מייל *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-input border-border text-foreground text-right"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-muted-foreground mb-2 text-right"
              >
                ספרו לנו על העסק שלכם
              </label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="bg-input border-border text-foreground text-right"
                placeholder="איזה סוג עסק יש לכם? כמה הזמנות אתם מקבלים ביום? אילו אתגרים אתם מתמודדים איתם?"
                dir="rtl"
              />
            </div>

            {/* Error Message */}
            {submitStatus === "error" && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive text-sm">{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-5 w-5" />
                  שלח
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
