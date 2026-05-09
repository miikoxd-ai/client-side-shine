import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLicenceStore, type Licence, type Proficiency, type LicenceType } from "@/store/licence";
import { PhotoUpload } from "./PhotoUpload";

export function EditLicenceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const licence = useLicenceStore((s) => s.licence);
  const setLicence = useLicenceStore((s) => s.setLicence);
  const resetLicence = useLicenceStore((s) => s.resetLicence);
  const [draft, setDraft] = useState<Licence>(licence);

  useEffect(() => {
    if (open) setDraft(licence);
  }, [open, licence]);

  const update = <K extends keyof Licence>(k: K, v: Licence[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Licence Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </Field>
          <Field label="Middle initial">
            <Input value={draft.middleInitial} onChange={(e) => update("middleInitial", e.target.value)} maxLength={2} />
          </Field>
          <Field label="Last name" full>
            <Input value={draft.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </Field>

          <Field label="Licence number">
            <Input value={draft.licenceNumber} onChange={(e) => update("licenceNumber", e.target.value)} />
          </Field>
          <Field label="Licence type">
            <Select value={draft.type} onValueChange={(v) => update("type", v as LicenceType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Car">Car</SelectItem>
                <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                <SelectItem value="Heavy Vehicle">Heavy Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Proficiency" full>
            <Select value={draft.proficiency} onValueChange={(v) => update("proficiency", v as Proficiency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full">Full</SelectItem>
                <SelectItem value="Probationary P1">Probationary P1</SelectItem>
                <SelectItem value="Probationary P2">Probationary P2</SelectItem>
                <SelectItem value="Learner">Learner</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Date of birth">
            <Input type="date" value={draft.dob} onChange={(e) => update("dob", e.target.value)} />
          </Field>
          <Field label="Expiry">
            <Input type="date" value={draft.expiry} onChange={(e) => update("expiry", e.target.value)} />
          </Field>

          <Field label="Street" full>
            <Input value={draft.street} onChange={(e) => update("street", e.target.value)} />
          </Field>
          <Field label="Suburb">
            <Input value={draft.suburb} onChange={(e) => update("suburb", e.target.value)} />
          </Field>
          <Field label="State">
            <Input value={draft.state} onChange={(e) => update("state", e.target.value)} />
          </Field>
          <Field label="Postcode" full>
            <Input value={draft.postcode} onChange={(e) => update("postcode", e.target.value)} />
          </Field>

          <Field label="Permit status">
            <Select value={draft.permitStatus} onValueChange={(v) => update("permitStatus", v as Licence["permitStatus"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Current">Current</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Permit issue date">
            <Input type="date" value={draft.permitIssueDate} onChange={(e) => update("permitIssueDate", e.target.value)} />
          </Field>

          <Field label="Demerit points" full>
            <Input
              type="number"
              min={0}
              max={12}
              value={draft.demeritPoints}
              onChange={(e) => update("demeritPoints", Number(e.target.value))}
            />
          </Field>

          <Field label="Photo" full>
            <PhotoUpload
              label="Licence photo"
              value={draft.photoUrl}
              url={draft.photoLinkUrl}
              onChange={(v) => update("photoUrl", v)}
              onUrlChange={(v) => update("photoLinkUrl", v)}
              aspect="portrait"
            />
          </Field>
          <Field label="Photo link (URL)" full>
            <Input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={draft.photoLinkUrl ?? ""}
              onChange={(e) => update("photoLinkUrl", e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used as the photo parameter in the QR verify link. Your uploaded photo above is always shown on the licence.
            </p>
          </Field>
          <Field label="Signature" full>
            <PhotoUpload label="Signature image" value={draft.signatureUrl} onChange={(v) => update("signatureUrl", v)} aspect="wide" />
          </Field>
        </div>

        <DialogFooter className="mt-4 flex justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              resetLicence();
              onOpenChange(false);
            }}
          >
            Reset to default
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setLicence(draft);
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "col-span-2" : "col-span-1"}>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
