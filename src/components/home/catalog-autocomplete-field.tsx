"use client";

import { useMemo, useState } from "react";
import type { CatalogSuggestion } from "@/lib/catalog";

type CatalogAutocompleteFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  suggestions: CatalogSuggestion[];
  emptyActionLabel?: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: CatalogSuggestion) => void;
  onCreateCustom?: (value: string) => void;
};

export function CatalogAutocompleteField({
  label,
  required = false,
  value,
  placeholder,
  suggestions,
  emptyActionLabel,
  onChange,
  onSelect,
  onCreateCustom
}: CatalogAutocompleteFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const trimmedValue = value.trim();
  const showPanel = isFocused && (suggestions.length > 0 || (!!trimmedValue && !!onCreateCustom));

  const normalizedLabels = useMemo(
    () => suggestions.map((suggestion) => suggestion.label.trim().toLowerCase()),
    [suggestions]
  );
  const hasExactSuggestion = normalizedLabels.includes(trimmedValue.toLowerCase());

  return (
    <div className="field">
      <label>
        {label}
        {required ? <span className="req"> *</span> : null}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        autoComplete="off"
      />

      {showPanel ? (
        <div className="catalog-panel">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="catalog-option"
              type="button"
              onClick={() => onSelect(suggestion)}
            >
              <span className="catalog-option-main">
                <span className="catalog-option-label">{suggestion.label}</span>
                {suggestion.detail ? <span className="catalog-option-detail">{suggestion.detail}</span> : null}
              </span>
              <span className={suggestion.source === "seed" ? "catalog-badge" : "catalog-badge user"}>
                {suggestion.source === "seed" ? "Library" : "Yours"}
              </span>
            </button>
          ))}

          {!!trimmedValue && !hasExactSuggestion && onCreateCustom ? (
            <button
              className="catalog-option catalog-option-add"
              type="button"
              onClick={() => onCreateCustom(trimmedValue)}
            >
              <span className="catalog-option-main">
                <span className="catalog-option-label">
                  {emptyActionLabel ?? `Add "${trimmedValue}"`}
                </span>
                <span className="catalog-option-detail">Save this to your personal catalog</span>
              </span>
              <span className="catalog-badge user">Custom</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
