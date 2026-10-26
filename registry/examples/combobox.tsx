"use client";

import * as React from "react";
import { Plus, Store } from "lucide-react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useCombobox,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const MERCHANTS = [
  { value: "amazon", label: "Amazon" },
  { value: "wayfair", label: "Wayfair" },
  { value: "staples", label: "Staples" },
  { value: "bestbuy", label: "Best Buy" },
  { value: "lowes", label: "Lowe's" },
  { value: "target", label: "Target" },
  { value: "kohls", label: "Kohl's", disabled: true },
];

const CATEGORIES = ["office", "furniture", "electronics", "groceries", "travel", "software", "hardware", "gifts"];

export function Site() {
  const [merchant, setMerchant] = React.useState<string | null>("wayfair");
  return (
    <div className="grid w-full max-w-80 gap-1.5">
      <Label id="merchant-label">Merchant</Label>
      <Combobox items={MERCHANTS} value={merchant} onValueChange={setMerchant} name="merchant">
        <ComboboxTrigger aria-labelledby="merchant-label">
          <ComboboxValue placeholder="Choose a merchant" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search merchants" />
          <ComboboxList>
            <ComboboxEmpty>No merchant by that name.</ComboboxEmpty>
            {MERCHANTS.map((m) => (
              <ComboboxItem key={m.value} value={m.value} label={m.label} disabled={m.disabled}>
                <Store strokeWidth={1.5} />
                {m.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Multiple() {
  const [values, setValues] = React.useState<string[]>(["office", "electronics"]);
  return (
    <div className="grid w-full max-w-100 gap-1.5">
      <Label htmlFor="categories">Allowed categories</Label>
      <Combobox multiple items={CATEGORIES} value={values} onValueChange={setValues} name="categories">
        <ComboboxChips>
          {values.map((v) => (
            <ComboboxChip key={v} value={v} />
          ))}
          <ComboboxChipsInput id="categories" placeholder={values.length ? "" : "Add categories"} />
          <ComboboxClear />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No such category.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Groups() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-80 gap-1.5">
      <Label id="region-label">Ship from</Label>
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger aria-labelledby="region-label">
          <ComboboxValue placeholder="Choose a warehouse" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search warehouses" />
          <ComboboxList>
            <ComboboxEmpty>No warehouse found.</ComboboxEmpty>
            <ComboboxGroup heading="United States">
              <ComboboxItem value="sfo">San Francisco</ComboboxItem>
              <ComboboxItem value="jfk">New York</ComboboxItem>
            </ComboboxGroup>
            <ComboboxSeparator />
            <ComboboxGroup heading="Europe">
              <ComboboxItem value="ams">Amsterdam</ComboboxItem>
              <ComboboxItem value="ber">Berlin</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function CreateRow({ known }: { known: string[] }) {
  const { search } = useCombobox();
  const value = search.trim().toLowerCase();
  if (!value || known.includes(value)) return null;
  return (
    <>
      <ComboboxSeparator />
      <ComboboxItem value={value} label={value}>
        <Plus strokeWidth={1.75} />
        Create &ldquo;{value}&rdquo;
      </ComboboxItem>
    </>
  );
}

export function Creatable() {
  const [tags, setTags] = React.useState(["urgent", "gift", "recurring"]);
  const [tag, setTag] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-80 gap-1.5">
      <Label id="tag-label">Order tag</Label>
      <Combobox
        items={tags}
        value={tag}
        onValueChange={(v) => {
          if (v && !tags.includes(v)) setTags((t) => [...t, v]);
          setTag(v);
        }}
      >
        <ComboboxTrigger aria-labelledby="tag-label">
          <ComboboxValue placeholder="Add a tag" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search or create a tag" />
          <ComboboxList>
            {tags.map((t) => (
              <ComboboxItem key={t} value={t}>
                {t}
              </ComboboxItem>
            ))}
            <CreateRow known={tags} />
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-80 gap-3">
      <Combobox items={MERCHANTS} disabled>
        <ComboboxTrigger aria-label="Disabled merchant">
          <ComboboxValue placeholder="Disabled" />
        </ComboboxTrigger>
      </Combobox>
      <Combobox items={MERCHANTS}>
        <ComboboxTrigger aria-label="Required merchant" aria-invalid>
          <ComboboxValue placeholder="Choose a merchant" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search merchants" />
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item.value} label={item.label}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="font-sans text-body-sm text-danger">Choose a merchant to continue.</p>
    </div>
  );
}
