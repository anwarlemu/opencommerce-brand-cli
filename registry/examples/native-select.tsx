import { Field } from "@/components/ui/field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";

export function Site() {
  return (
    <Field label="Default store" htmlFor="native-store" className="max-w-80">
      <NativeSelect id="native-store" name="store" defaultValue="wayfair" className="w-full">
        <NativeSelectOptGroup label="Home">
          <NativeSelectOption value="wayfair">Wayfair</NativeSelectOption>
          <NativeSelectOption value="lowes">Lowe's</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Office">
          <NativeSelectOption value="staples">Staples</NativeSelectOption>
          <NativeSelectOption value="bestbuy">Best Buy</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </Field>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <NativeSelect size="sm" aria-label="Region" defaultValue="us">
        <NativeSelectOption value="us">United States</NativeSelectOption>
        <NativeSelectOption value="ca">Canada</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Carrier" aria-invalid defaultValue="">
        <NativeSelectOption value="" disabled>
          Choose a carrier
        </NativeSelectOption>
        <NativeSelectOption value="ups">UPS</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Locked" disabled defaultValue="usd">
        <NativeSelectOption value="usd">USD</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
