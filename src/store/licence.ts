import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Proficiency = "Full" | "Probationary P1" | "Probationary P2" | "Learner";
export type LicenceType = "Car" | "Motorcycle" | "Heavy Vehicle";

export type Vehicle = {
  id: string;
  rego: string;
  make: string;
  model: string;
  year: string;
};

export type Licence = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  licenceNumber: string;
  type: LicenceType;
  proficiency: Proficiency;
  dob: string; // ISO yyyy-mm-dd
  expiry: string; // ISO yyyy-mm-dd
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  permitStatus: "Current" | "Expired" | "Suspended";
  permitIssueDate: string; // ISO
  photoUrl?: string;
  photoLinkUrl?: string;
  signatureUrl?: string;
  demeritPoints: number;
  vehicles: Vehicle[];
  cardNumber: string;
  licenceStatus: "Current" | "Expired" | "Suspended";
  issueDate: string; // ISO
  conditions: string[];
};

const DEFAULT_LICENCE: Licence = {
  firstName: "John",
  middleInitial: "M",
  lastName: "Citizen",
  licenceNumber: "012345678",
  type: "Car",
  proficiency: "Probationary P2",
  dob: "2000-11-20",
  expiry: "2026-12-10",
  street: "180 Lonsdale St",
  suburb: "Melbourne",
  state: "VIC",
  postcode: "3000",
  permitStatus: "Current",
  permitIssueDate: "2025-10-02",
  demeritPoints: 0,
  vehicles: [],
  cardNumber: "G7421953K",
  licenceStatus: "Current",
  issueDate: "2018-12-10",
  conditions: [],
};

const CONDITION_LABELS: Record<string, string> = {
  A: "Automatic transmission",
  I: "Alcohol interlock device",
  B: "Bioptic telescopic lens",
  S: "Special",
  M: "Modified controls",
};

export function conditionLabel(letter: string) {
  return CONDITION_LABELS[letter.toUpperCase()] ?? "Other condition";
}

type State = {
  licence: Licence;
  passcodeHash: string | null;
  unlocked: boolean;
  hasHydrated: boolean;
  setLicence: (l: Partial<Licence>) => void;
  resetLicence: () => void;
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  removeVehicle: (id: string) => void;
  setPasscodeHash: (h: string) => void;
  setUnlocked: (u: boolean) => void;
  setHasHydrated: (h: boolean) => void;
};

export const useLicenceStore = create<State>()(
  persist(
    (set) => ({
      licence: DEFAULT_LICENCE,
      passcodeHash: null,
      unlocked: false,
      hasHydrated: false,
      setLicence: (l) => set((s) => ({ licence: { ...s.licence, ...l } })),
      resetLicence: () => set({ licence: DEFAULT_LICENCE }),
      addVehicle: (v) =>
        set((s) => ({
          licence: {
            ...s.licence,
            vehicles: [...s.licence.vehicles, { ...v, id: crypto.randomUUID() }],
          },
        })),
      removeVehicle: (id) =>
        set((s) => ({
          licence: { ...s.licence, vehicles: s.licence.vehicles.filter((v) => v.id !== id) },
        })),
      setPasscodeHash: (h) => set({ passcodeHash: h }),
      setUnlocked: (u) => set({ unlocked: u }),
      setHasHydrated: (h) => set({ hasHydrated: h }),
    }),
    {
      name: "vicstate-id",
      partialize: (s) => ({ licence: s.licence, passcodeHash: s.passcodeHash }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          licence: { ...DEFAULT_LICENCE, ...(p.licence ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function fullName(l: Licence) {
  return [l.firstName, l.middleInitial, l.lastName].filter(Boolean).join(" ");
}

export function fullAddress(l: Licence) {
  return `${l.street}\n${l.suburb} ${l.state} ${l.postcode}`;
}

export function ageFrom(dob: string) {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

export function proficiencyBadge(p: Proficiency) {
  switch (p) {
    case "Full":
      return { label: "FULL DRIVER LICENCE", color: "bg-green-700", chip: null };
    case "Probationary P1":
      return { label: "PROBATIONARY DRIVER LICENCE", color: "bg-red-600", chip: { letter: "P", bg: "bg-red-600" } };
    case "Probationary P2":
      return { label: "PROBATIONARY DRIVER LICENCE", color: "bg-red-600", chip: { letter: "P", bg: "bg-green-600" } };
    case "Learner":
      return { label: "LEARNER PERMIT", color: "bg-yellow-500", chip: { letter: "L", bg: "bg-yellow-500" } };
  }
}
