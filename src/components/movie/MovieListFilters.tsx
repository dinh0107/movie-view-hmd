"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Country = { slug?: string; name: string };

type Props = {
  country: string;
  lang: string;
  year: string;
  countries: Country[];
  onCountryChange: (v: string) => void;
  onLangChange: (v: string) => void;
  onYearChange: (v: string) => void;
  showLang?: boolean;
};

export function MovieListFilters({
  country,
  lang,
  year,
  countries,
  onCountryChange,
  onLangChange,
  onYearChange,
  showLang = true,
}: Props) {
  const years = Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 2025 - i);

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <FilterSelect
        value={country}
        placeholder="Quốc gia"
        onChange={onCountryChange}
        onClear={() => onCountryChange("")}
      >
        {countries.map((c) => (
          <SelectItem key={c.slug ?? c.name} value={c.slug ?? ""}>
            {c.name}
          </SelectItem>
        ))}
      </FilterSelect>

      {showLang && (
        <FilterSelect
          value={lang}
          placeholder="Phụ đề"
          onChange={onLangChange}
          onClear={() => onLangChange("")}
        >
          <SelectItem value="vietsub">Vietsub</SelectItem>
          <SelectItem value="thuyet-minh">Thuyết minh</SelectItem>
          <SelectItem value="long-tieng">Lồng tiếng</SelectItem>
        </FilterSelect>
      )}

      <FilterSelect
        value={year}
        placeholder="Năm phát hành"
        onChange={onYearChange}
        onClear={() => onYearChange("")}
        contentClassName="max-h-60"
      >
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </FilterSelect>
    </div>
  );
}

function FilterSelect({
  value,
  placeholder,
  onChange,
  onClear,
  children,
  contentClassName,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onClear: () => void;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="relative min-w-[140px] flex-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full glass-panel">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>{children}</SelectContent>
      </Select>
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 size-6 -translate-y-1/2 rounded-full bg-background text-primary hover:bg-accent"
          onClick={onClear}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
