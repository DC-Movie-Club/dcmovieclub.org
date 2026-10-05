"use client";

import { colorRoles, isHexColor, type ColorRoleKey } from "@/config/pages";
import { ColorPopover } from "@/app/admin/components/ColorPopover";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// `colors` holds "" for a role that isn't set, and may hold half-typed hex
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
      {Object.values(colorRoles).map((role) => {
        const value = colors[role.key];
        const id = `color-${role.key}`;
        return (
          <Field key={role.key} orientation="horizontal" className="gap-3">
            <ColorPopover
              role={role}
              value={value}
              colors={colors}
              onChange={(next) => onChange(role.key, next)}
            />
            <FieldLabel htmlFor={id} className="flex-1">
              {role.label}
            </FieldLabel>
            <Input
              id={id}
              value={value}
              placeholder="Not set"
              spellCheck={false}
              aria-invalid={!!value && !isHexColor(value)}
              className="w-28 shrink-0 font-mono"
              onChange={(e) => onChange(role.key, e.target.value.trim())}
            />
          </Field>
        );
      })}
    </FieldGroup>
  );
}
