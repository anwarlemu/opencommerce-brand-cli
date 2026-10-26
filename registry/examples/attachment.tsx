"use client";

import { useState } from "react";
import { Download, FileText, ImageIcon, RotateCw, X } from "lucide-react";

import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment";

const FILES = [
  { name: "receipt-A-10293.pdf", size: "84 KB" },
  { name: "invoice-october.pdf", size: "212 KB" },
  { name: "packing-slip.pdf", size: "36 KB" },
];

export function Site() {
  const [files, setFiles] = useState(FILES);
  const [opened, setOpened] = useState<string>();
  return (
    <div className="grid w-full gap-3">
      <AttachmentGroup>
        {files.map((file) => (
          <Attachment key={file.name}>
            <AttachmentTrigger aria-label={`Open ${file.name}`} onClick={() => setOpened(file.name)} />
            <AttachmentMedia>
              <FileText strokeWidth={1.5} />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>{file.size}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label={`Remove ${file.name}`} onClick={() => setFiles((all) => all.filter((f) => f.name !== file.name))}>
                <X strokeWidth={1.5} />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}
      </AttachmentGroup>
      <p aria-live="polite" className="text-body-sm text-fg-muted">
        {opened ? `Opened ${opened}.` : files.length ? "Choose a file to open it." : "All files removed."}
      </p>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap gap-3">
      <Attachment state="idle">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>return-label.pdf</AttachmentTitle>
          <AttachmentDescription>Waiting</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>receipt-T-48211.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading 62%</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>statement.pdf</AttachmentTitle>
          <AttachmentDescription>The file is over 20 MB.</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Retry">
            <RotateCw strokeWidth={1.5} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {(["default", "sm", "xs"] as const).map((size) => (
        <Attachment key={size} size={size}>
          <AttachmentMedia>
            <FileText strokeWidth={1.5} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>order-{size}.pdf</AttachmentTitle>
            <AttachmentDescription>48 KB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
      <Attachment orientation="vertical">
        <AttachmentMedia>
          <ImageIcon strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>product.jpg</AttachmentTitle>
          <AttachmentDescription>1.2 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download product.jpg">
            <Download strokeWidth={1.5} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  );
}
