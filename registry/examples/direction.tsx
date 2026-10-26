"use client";

import { DirectionProvider } from "@/components/ui/direction";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Site() {
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="grid max-w-110 gap-4 font-sans text-body-sm text-fg">
        <p>الطلبات</p>
        <ToggleGroup type="single" defaultValue="live" aria-label="الحالة">
          <ToggleGroupItem value="live">مباشر</ToggleGroupItem>
          <ToggleGroupItem value="failed">فشل</ToggleGroupItem>
          <ToggleGroupItem value="all">الكل</ToggleGroupItem>
        </ToggleGroup>
        <Slider defaultValue={[30]} aria-label="الميزانية" />
      </div>
    </DirectionProvider>
  );
}
