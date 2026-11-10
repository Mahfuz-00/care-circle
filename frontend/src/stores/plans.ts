import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface PlanItem {
  code: string
  name: string
  price_monthly: number
  price_annual: number
  seats: number | null
  medications: number | null
  voice_minutes: number | null
  trial_days: number
  is_popular?: boolean
  features: string[]
  notes: string | null
  status: 'active' | 'archived'
}

interface PlanState {
  plans: PlanItem[]
  addPlan: (plan: Omit<PlanItem, 'status'> & { status?: 'active' | 'archived' }) => void
  updatePlan: (code: string, updates: Partial<PlanItem>) => void
  deletePlan: (code: string) => void
  togglePopular: (code: string) => void
  resetToDefaults: () => void
}

export const DEFAULT_PLANS: PlanItem[] = [
  {
    code: 'starter',
    name: 'Essential Care',
    price_monthly: 0,
    price_annual: 0,
    seats: 2,
    medications: 5,
    voice_minutes: 0,
    trial_days: 30,
    is_popular: false,
    features: [
      '2 Family Caregiver Seats',
      'Up to 5 Tracked Prescriptions',
      'One-Tap Senior Mobile App Confirmation',
      'In-App & Push Notification Reminders',
      'Bank-Grade Private Family Vault',
      'Basic 30-Day Adherence History',
    ],
    notes: 'Push-only notifications, up to 2 caregivers. Free for independent seniors.',
    status: 'active',
  },
  {
    code: 'family_plus',
    name: 'Family Complete',
    price_monthly: 19,
    price_annual: 190,
    seats: 5,
    medications: 15,
    voice_minutes: 60,
    trial_days: 30,
    is_popular: true,
    features: [
      '5 Family & Caregiver Seats',
      'Up to 15 Tracked Prescriptions',
      '60 Automated Voice Minutes / Month',
      '6-Gate Server Escalation Cascade',
      'Stock Burndown & Proactive Refill Alerts',
      'Preferred Pharmacy Direct Dialer',
      'Tamperproof Multi-Caregiver Audit Ledger',
      'Household Quiet Hours Enforcement',
    ],
    notes: '60 voice minutes/mo, multi-caregiver escalation, stock forecasting.',
    status: 'active',
  },
  {
    code: 'care_team',
    name: 'Care Circle Pro',
    price_monthly: 39,
    price_annual: 390,
    seats: null,
    medications: null,
    voice_minutes: 180,
    trial_days: 30,
    is_popular: false,
    features: [
      'Unlimited Family & Professional Caregivers',
      'Unlimited Tracked Medications & Regimens',
      '180 Automated Voice Minutes / Month',
      'Multi-Channel Escalation (Push, SMS, Phone)',
      '24/7 SOS Emergency Lifeline',
      'Doctor Appointment Coordination & Notes',
      'Dedicated Priority Support & Onboarding',
      'Clinical Adherence CSV & PDF Export',
    ],
    notes: 'Unlimited circle seats, unlimited medications, 180 voice minutes, full coordination.',
    status: 'active',
  },
]

const STORAGE_KEY = 'carecircle.platform.plans.catalogue'

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plans: DEFAULT_PLANS,

      addPlan: (newPlan) =>
        set((state) => {
          // If code already exists, replace or append
          const exists = state.plans.some((p) => p.code === newPlan.code)
          const planWithStatus: PlanItem = {
            ...newPlan,
            status: newPlan.status ?? 'active',
          }
          if (exists) {
            return {
              plans: state.plans.map((p) => (p.code === newPlan.code ? planWithStatus : p)),
            }
          }
          return { plans: [...state.plans, planWithStatus] }
        }),

      updatePlan: (code, updates) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.code === code ? { ...p, ...updates } : p)),
        })),

      deletePlan: (code) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.code !== code),
        })),

      togglePopular: (code) =>
        set((state) => ({
          plans: state.plans.map((p) => ({
            ...p,
            is_popular: p.code === code ? !p.is_popular : false,
          })),
        })),

      resetToDefaults: () => set({ plans: DEFAULT_PLANS }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
