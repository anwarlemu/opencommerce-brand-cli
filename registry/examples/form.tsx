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
