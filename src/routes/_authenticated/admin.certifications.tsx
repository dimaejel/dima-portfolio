import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { AdminInput, AdminLabel } from "@/components/admin/PageHeader";
import { fetchCertifications, qk, type Certification } from "@/lib/cms";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { MediaImage } from "@/components/MediaImage";

export const Route = createFileRoute("/_authenticated/admin/certifications")({
  component: CertificationsAdmin,
});

function CertificationsAdmin() {
  return (
    <CrudList<Certification>
      title="Certifications"
      description="Professional certifications and credentials."
      table="certifications"
      queryKey={qk.certificationsAll}
      fetchAll={() => fetchCertifications(true)}
      emptyLabel="No certifications yet."
      makeDefault={() => ({ title: "", issuer: "", date: "", gradient: "from-blue-500 to-violet-500", visible: true })}
      columns={[
        { header: "Title", render: (r) => <div className="font-semibold">{r.title}</div> },
        { header: "Issuer", render: (r) => r.issuer },
        { header: "Date", render: (r) => <span className="font-mono text-xs">{r.date}</span> },
      ]}
      renderForm={(v, onChange) => (
        <div className="grid gap-3">
          <div><AdminLabel>Title</AdminLabel><AdminInput value={v.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><AdminLabel>Issuer</AdminLabel><AdminInput value={v.issuer ?? ""} onChange={(e) => onChange({ issuer: e.target.value })} /></div>
            <div><AdminLabel>Date</AdminLabel><AdminInput value={v.date ?? ""} onChange={(e) => onChange({ date: e.target.value })} /></div>
          </div>
          <div><AdminLabel>Verify link</AdminLabel><AdminInput value={v.link ?? ""} onChange={(e) => onChange({ link: e.target.value })} /></div>
          <div>
            <AdminLabel>Certificate image</AdminLabel>
            <div className="flex flex-wrap items-center gap-3">
              <MediaImage path={v.image_url} alt="Certificate preview" className="h-14 w-24 rounded object-cover border border-border" />
              <AdminInput value={v.image_url ?? ""} onChange={(e) => onChange({ image_url: e.target.value })} placeholder="certifications/…" />
              <MediaUpload folder="certifications" table="certifications" recordId={v.id} field="image_url" label="Upload certificate image" onSaved={(value) => { if (typeof value === "string") onChange({ image_url: value }); }} />
            </div>
          </div>
          <div>
            <AdminLabel>Certificate document</AdminLabel>
            <AdminInput value={v.document_url ?? ""} onChange={(e) => onChange({ document_url: e.target.value })} placeholder="certifications/…" />
            <MediaUpload folder="certifications" table="certifications" recordId={v.id} field="document_url" accept="application/pdf" label="Upload certificate document" onSaved={(value) => { if (typeof value === "string") onChange({ document_url: value }); }} />
          </div>
          <div><AdminLabel>Gradient (Tailwind)</AdminLabel><AdminInput value={v.gradient ?? ""} onChange={(e) => onChange({ gradient: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
          </label>
        </div>
      )}
    />
  );
}
