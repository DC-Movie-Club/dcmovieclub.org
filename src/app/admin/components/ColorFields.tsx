"use client";

import {
  colorRoles,
  isHexColor,
  navPages,
  placeholderOf,
  type ColorRoleKey,
  type PageKey,
} from "@/config/pages";
import { ColorPopover, Contrast } from "@/app/admin/components/ColorPopover";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// `value` is "" when the color isn't set, and may be half-typed hex
function ColorField({
  id,
  label,
  value,
  placeholder = "Not set",
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <Field orientation="horizontal" className="gap-3">
      <ColorPopover label={label} value={value} onChange={onChange}>
        {children}
      </ColorPopover>
      <FieldLabel htmlFor={id} className="flex-1">
        {label}
      </FieldLabel>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        aria-invalid={!!value && !isHexColor(value)}
        className="w-28 shrink-0 font-mono"
        onChange={(e) => onChange(e.target.value.trim())}
      />
    </Field>
  );
}

export function ColorFields({
  colors,
  onChange,
}: {
  colors: Record<ColorRoleKey, string>;
  onChange: (role: ColorRoleKey, value: string) => void;
}) {
  return (
    <FieldGroup className="gap-3">
      <FieldDescription>
        Pick a swatch to try a color. The preview updates right away, and the
        site changes when you save.
      </FieldDescription>
      {Object.values(colorRoles).map((role) => (
        <ColorField
          key={role.key}
          id={`color-${role.key}`}
          label={role.label}
          value={colors[role.key]}
          placeholder={placeholderOf(role.key)}
          onChange={(next) => onChange(role.key, next)}
        >
          <Contrast role={role.key} colors={colors} />
        </ColorField>
      ))}
    </FieldGroup>
  );
}

export function NavColorFields({
  colors,
  onChange,
}: {
  colors: Partial<Record<PageKey, string>>;
  onChange: (page: PageKey, value: string) => void;
}) {
  return (
    <FieldGroup className="gap-3">
      <FieldDescription>
        Each page&apos;s item in the bottom nav uses the page&apos;s accent
        color. Pick a color here to use a different one in the nav. The nav
        changes when you save.
      </FieldDescription>
      {navPages.map((page) => (
        <ColorField
          key={page.key}
          id={`nav-color-${page.key}`}
          label={page.label}
          value={colors[page.key] ?? ""}
          placeholder="Page accent"
          onChange={(next) => onChange(page.key, next)}
        />
      ))}
    </FieldGroup>
  );
}
