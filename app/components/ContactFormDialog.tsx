import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send } from 'lucide-react';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Close dialog after submission
    onOpenChange(false);
    // Reset form
    setFormData({
      fullName: '',
      businessName: '',
      phone: '',
      email: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-auto bg-card text-card-foreground border-border dark" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-card-foreground">כתבו לנו</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            מלאו את הפרטים ונחזור אליכם תוך 24 שעות עם הדגמה אישית
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-muted-foreground mb-2 text-right">שם מלא *</label>
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
            <label htmlFor="businessName" className="block text-muted-foreground mb-2 text-right">שם העסק *</label>
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
            <label htmlFor="phone" className="block text-muted-foreground mb-2 text-right">מספר טלפון *</label>
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
            <label htmlFor="email" className="block text-muted-foreground mb-2 text-right">כתובת מייל *</label>
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
            <label htmlFor="message" className="block text-muted-foreground mb-2 text-right">ספרו לנו על העסק שלכם</label>
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

          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
          >
            <Send className="ml-2 h-5 w-5" />
            שלח
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}