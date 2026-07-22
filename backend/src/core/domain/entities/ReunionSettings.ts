export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface ScheduleDay {
  date: string;
  items: ScheduleItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ReunionSettings {
  id?: string;
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
  scheduleFriday: ScheduleDay;
  scheduleSaturday: ScheduleDay;
  scheduleSunday: ScheduleDay;
  faqTitle: string;
  faqSubtitle: string;
  faqs: FaqItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
