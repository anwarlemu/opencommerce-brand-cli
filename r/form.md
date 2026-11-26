# Form
react-hook-form wired to the brand's field layout: a 12px muted label, the control, a hint or a red message.

Install: npx opencommerce-ds add form
Requires: theme, label, utils
Packages: @radix-ui/react-slot, react-hook-form
Exports: Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField
Client boundary: yes
Reference: Extrapolated from opencommerce (the Field: label, control, hint)


## Usage
Use for any form with validation. Create the form with useForm, wrap it in Form, and give each control a FormField with FormItem, FormLabel, FormControl around the control, and FormDescription or FormMessage under it. Validation rules go in FormField's rules or a resolver.
- Avoid: Red labels on invalid fields
- Avoid: Validating on every keystroke before the first submit
- Avoid: Hiding the error message in a tooltip


## Examples
Example components: npx opencommerce-ds add form button checkbox input label radio-group select spinner switch textarea
Example packages: react-hook-form
[Site](https://opencommerce-ds.vercel.app/preview/form/Site)

examples/form.tsx

```tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Values = { name: string; budget: string; store: string; mode: string; notes: string; receipts: boolean; terms: boolean };

export function Site() {
  const form = useForm<Values>({ defaultValues: { name: "", budget: "", store: "", mode: "confirm", notes: "", receipts: true, terms: false } });
  const [state, setState] = React.useState<"idle" | "saving" | "saved">("idle");
  const onSubmit = form.handleSubmit(async () => {
    setState("saving");
    await new Promise((r) => setTimeout(r, 900));
    setState("saved");
  });
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="grid w-full max-w-110 gap-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name the agent.", pattern: { value: /^[a-z0-9-]+$/, message: "Use lowercase letters, numbers and dashes." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent name</FormLabel>
              <FormControl>
                <Input placeholder="office-supplies" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Shown on every order this agent places.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          rules={{ required: "Set a per-order budget.", validate: (v) => Number(v) > 0 || "Enter an amount above zero." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Per-order budget (USD)</FormLabel>
              <FormControl>
                <Input inputMode="decimal" placeholder="200" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="store"
          rules={{ required: "Choose a default store." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default store</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="staples">Staples</SelectItem>
                  <SelectItem value="wayfair">Wayfair</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checkout</FormLabel>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange} name={field.name}>
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="auto" id="mode-auto" />
                    <Label variant="control" htmlFor="mode-auto">Buy automatically</Label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="confirm" id="mode-confirm" />
                    <Label variant="control" htmlFor="mode-confirm">Ask before buying</Label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          rules={{ maxLength: { value: 200, message: "Keep notes under 200 characters." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes for the agent</FormLabel>
              <FormControl>
                <Textarea placeholder="Prefer recycled paper." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="receipts"
          render={({ field }) => (
            <FormItem className="flex-row items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <FormLabel>Email receipts</FormLabel>
                <FormDescription>Send each receipt to the finance inbox.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          rules={{ validate: (v) => v || "Accept the spending policy to continue." }}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2.5">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                </FormControl>
                <FormLabel className="font-sans text-body-sm text-fg">I accept the spending policy</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={state === "saving"}>
            {state === "saving" && <Spinner />}
            {state === "saving" ? "Creating agent" : "Create agent"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => { form.reset(); setState("idle"); }}>
            Reset
          </Button>
        </div>
        <p role="status" className="font-sans text-body-sm text-fg-muted">
          {state === "saved" ? "Agent created. It can place orders now." : ""}
        </p>
      </form>
    </Form>
  );
}

```

## Source

components/ui/form.tsx

```tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, useFormState, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// A react-hook-form form laid out as the brand's Field: each FormItem stacks its 12px Inter label at 64 percent ink, the
// control 6px below it, then a 14px line under the control: a FormDescription at 64 percent ink, or the FormMessage in
// the brand's red when the value is rejected. A field that fails keeps its label as it is: only the control (aria-invalid,
// the red edge) and the message turn red. Fields sit 16px apart in a form.
const Form = FormProvider;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

/** The state of the field around it: its ids for labels and messages, and react-hook-form's error, dirty and touched state. */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  if (!fieldContext) throw new Error("useFormField should be used within <FormField>");
  if (!itemContext) throw new Error("useFormField should be used within <FormItem>");
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;
  return { id, name: fieldContext.name, formItemId: `${id}-form-item`, formDescriptionId: `${id}-form-item-description`, formMessageId: `${id}-form-item-message`, ...fieldState };
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("flex min-w-0 flex-col gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return <Label data-slot="form-label" data-error={!!error} htmlFor={formItemId} className={cn("w-fit", className)} {...props} />;
}

/** Hands the field's id, its description and message ids and aria-invalid to the one control inside it. */
function FormControl(props: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return <Slot data-slot="form-control" id={formItemId} aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p data-slot="form-description" id={formDescriptionId} className={cn("m-0 font-sans text-body-sm leading-snug text-fg-muted", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) return null;
  return (
    <p data-slot="form-message" id={formMessageId} role={error ? "alert" : undefined} className={cn("m-0 font-sans text-body-sm leading-snug text-danger", className)} {...props}>
      {body}
    </p>
  );
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };

```
