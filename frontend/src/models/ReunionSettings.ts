import mongoose, { Schema, Document } from 'mongoose';

export interface IReunionSettings extends Document {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  eventTitle: string;
  eventSubtitle: string;
  eventDate: string;
  eventVenue: string;
  eventTime: string;
  expectedAttendance: string;
  earlyBirdTitle: string;
  earlyBirdDescription: string;
  earlyBirdPrice: string;
  earlyBirdLabel: string;
  regularPrice: string;
  regularLabel: string;
  secureNote: string;
  scheduleTitle: string;
  scheduleSubtitle: string;
  scheduleFriday: {
    date: string;
    items: { time: string; title: string; description: string }[];
  };
  scheduleSaturday: {
    date: string;
    items: { time: string; title: string; description: string }[];
  };
  scheduleSunday: {
    date: string;
    items: { time: string; title: string; description: string }[];
  };
  faqTitle: string;
  faqSubtitle: string;
  faqs: { question: string; answer: string }[];
}

const ReunionSettingsSchema = new Schema<IReunionSettings>(
  {
    heroBadge: { type: String, default: '🎉 4TH ANNUAL REUNION' },
    heroTitle: { type: String, default: 'Reunion 2026' },
    heroDescription: { type: String, default: 'Join fellow alumni for our biggest gathering yet!' },
    eventTitle: { type: String, default: 'Event Details' },
    eventSubtitle: { type: String, default: '4th Annual EX-POLS Reunion' },
    eventDate: { type: String, default: 'December 12-14, 2026' },
    eventVenue: { type: String, default: 'Kano International Conference Centre\nPlot 12, Zoo Road, Kano' },
    eventTime: { type: String, default: 'Friday 4PM - Sunday 2PM' },
    expectedAttendance: { type: String, default: '1,000+ Alumni & Guests' },
    earlyBirdTitle: { type: String, default: '🎟️ Early Bird Registration' },
    earlyBirdDescription: { type: String, default: 'Save 30% when you register before October 31, 2026' },
    earlyBirdPrice: { type: String, default: '₦15,000' },
    earlyBirdLabel: { type: String, default: 'Early Bird (Before Oct 31)' },
    regularPrice: { type: String, default: '₦20,000' },
    regularLabel: { type: String, default: 'Regular Registration' },
    secureNote: { type: String, default: '🔒 Secure payment • Refundable until Nov 30' },
    scheduleTitle: { type: String, default: 'Reunion Schedule' },
    scheduleSubtitle: { type: String, default: 'Three days of networking, celebration, and community service.' },
    scheduleFriday: {
      date: { type: String, default: 'Dec 12' },
      items: [{ time: String, title: String, description: String }]
    },
    scheduleSaturday: {
      date: { type: String, default: 'Dec 13' },
      items: [{ time: String, title: String, description: String }]
    },
    scheduleSunday: {
      date: { type: String, default: 'Dec 14' },
      items: [{ time: String, title: String, description: String }]
    },
    faqTitle: { type: String, default: 'Questions?' },
    faqSubtitle: { type: String, default: 'Reunion FAQs' },
    faqs: [{ question: String, answer: String }]
  },
  { timestamps: true }
);

export default mongoose.models.ReunionSettings || mongoose.model<IReunionSettings>('ReunionSettings', ReunionSettingsSchema);