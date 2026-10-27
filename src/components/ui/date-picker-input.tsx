"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ============================================================================
// Timezone-safe & Leap-Year-aware Date Helpers
// ============================================================================

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

/**
 * Creates a Date at local noon (12:00:00) to ensure timezone conversions
 * never cross midnight boundaries in any local timezone.
 */
export function createSafeLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Safely parses Date, ISO strings (YYYY-MM-DD), or US strings (MM/DD/YYYY)
 * without UTC-midnight date shift bugs.
 */
export function parseDateSafe(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return createSafeLocalDate(
        parseInt(isoMatch[1], 10),
        parseInt(isoMatch[2], 10),
        parseInt(isoMatch[3], 10)
      );
    }
    const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usMatch) {
      return createSafeLocalDate(
        parseInt(usMatch[3], 10),
        parseInt(usMatch[1], 10),
        parseInt(usMatch[2], 10)
      );
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function formatDateToMMDDYYYY(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function formatDateToYYYYMMDD(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats user input as MM/DD/YYYY while typing or pasting, allowing natural
 * deletion, editing in the middle, and manual slashes without getting stuck.
 */
export function formatRawDateInput(value: string, previousValue: string): string {
  if (!value) return "";

  // 1. Handle ISO paste (YYYY-MM-DD)
  if (value.includes("-")) {
    const parts = value.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[1].padStart(2, "0")}/${parts[2].slice(0, 2).padStart(2, "0")}/${parts[0]}`;
    }
  }

  // 2. If deleting, do NOT auto-inject slashes so backspace works freely
  if (value.length < previousValue.length) {
    return value;
  }

  // 3. Remove non-digits and non-slashes, collapse multiple slashes
  const cleaned = value.replace(/\/+/g, "/").replace(/[^\d/]/g, "");

  // 4. If user typed a manual trailing slash, respect it
  if (cleaned.endsWith("/")) {
    const segments = cleaned.split("/");
    if (segments.length <= 3) {
      return cleaned.slice(0, 10);
    }
  }

  // 5. If user typed without any slashes, auto-format with slashes
  const digits = cleaned.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";

  if (!cleaned.includes("/")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  // 6. If user entered some slashes, normalize parts
  const parts = cleaned.split("/");
  if (parts.length === 2) {
    const m = parts[0].slice(0, 2);
    const d = parts[1].slice(0, 2);
    if (parts[1].length > 2) {
      const y = parts[1].slice(2, 6);
      return `${m}/${d}/${y}`;
    }
    return `${m}/${d}`;
  }

  if (parts.length >= 3) {
    const m = parts[0].slice(0, 2);
    const d = parts[1].slice(0, 2);
    const y = parts[2].slice(0, 4);
    return `${m}/${d}/${y}`;
  }

  return cleaned.slice(0, 10);
}

export interface DateValidationOptions {
  isDob?: boolean;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
}

export function validateDateString(
  text: string,
  options?: DateValidationOptions
): { isValid: boolean; date: Date | null; error: string | null } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isValid: true, date: null, error: null };
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return {
      isValid: false,
      date: null,
      error: "Please enter a complete date (MM/DD/YYYY).",
    };
  }

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      date: null,
      error: "Invalid month (must be 01–12).",
    };
  }

  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    if (month === 2 && day === 29 && !isLeapYear(year)) {
      return {
        isValid: false,
        date: null,
        error: `${year} is not a leap year. February only has 28 days.`,
      };
    }
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return {
      isValid: false,
      date: null,
      error: `${monthNames[month - 1]} ${year} only has ${maxDays} days.`,
    };
  }

  if (year < 1900 || year > 2100) {
    return {
      isValid: false,
      date: null,
      error: "Year must be between 1900 and 2100.",
    };
  }

  const date = createSafeLocalDate(year, month, day);

  if (options?.isDob) {
    const today = new Date();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    if (date > endOfToday) {
      return {
        isValid: false,
        date: null,
        error: `${options.label || "Date of birth"} cannot be in the future.`,
      };
    }
  }

  if (options?.maxDate && date > options.maxDate) {
    return {
      isValid: false,
      date: null,
      error: `Date cannot be after ${formatDateToMMDDYYYY(options.maxDate)}.`,
    };
  }

  if (options?.minDate && date < options.minDate) {
    return {
      isValid: false,
      date: null,
      error: `Date cannot be before ${formatDateToMMDDYYYY(options.minDate)}.`,
    };
  }

  if (options?.disabledDates && options.disabledDates(date)) {
    return {
      isValid: false,
      date: null,
      error: "This date is not available.",
    };
  }

  return { isValid: true, date, error: null };
}

// ============================================================================
// Component Props & Implementation
// ============================================================================

export interface DatePickerInputProps {
  id?: string;
  name?: string;
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  onChangeString?: (val: string) => void;
  onBlur?: () => void;
  onValidationError?: (error: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isDob?: boolean;
  label?: string;
  className?: string;
  containerClassName?: string;
  error?: string;
  showErrorText?: boolean;
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
}

export function DatePickerInput({
  id,
  name,
  value,
  onChange,
  onChangeString,
  onBlur,
  onValidationError,
  placeholder = "MM/DD/YYYY",
  disabled = false,
  required = false,
  isDob = false,
  label,
  className,
  containerClassName,
  error: externalError,
  showErrorText = true,
  startMonth,
  endMonth,
  defaultMonth,
  minDate,
  maxDate,
  disabledDates,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const isFocusedRef = React.useRef<boolean>(false);

  // Parse external value safely
  const parsedPropDate = React.useMemo(() => parseDateSafe(value), [value]);

  // Maintain local text value
  const [textValue, setTextValue] = React.useState<string>(() =>
    formatDateToMMDDYYYY(parsedPropDate)
  );

  // Sync text value when external value changes, but NEVER while the user is actively typing!
  React.useEffect(() => {
    if (isFocusedRef.current) {
      return;
    }
    const formatted = formatDateToMMDDYYYY(parsedPropDate);
    setTextValue(formatted);
    if (parsedPropDate || value === null || value === undefined || value === "") {
      setLocalError(null);
    }
  }, [parsedPropDate, value]);

  // Active month in the calendar
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(() => {
    if (parsedPropDate) return parsedPropDate;
    if (defaultMonth) return defaultMonth;
    if (isDob) return new Date(1980, 0, 1);
    return new Date();
  });

  // Keep calendar month aligned with parsed date when it changes externally
  React.useEffect(() => {
    if (parsedPropDate) {
      setCalendarMonth(parsedPropDate);
    }
  }, [parsedPropDate]);

  const effectiveError = localError || externalError;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const raw = input.value;
    const prev = textValue;
    const selectionStart = input.selectionStart;

    const formatted = formatRawDateInput(raw, prev);
    setTextValue(formatted);

    // Preserve cursor position smoothly
    if (selectionStart !== null) {
      const diff = formatted.length - raw.length;
      const newPos = Math.max(0, selectionStart + diff);
      if (diff !== 0 || selectionStart < raw.length) {
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(newPos, newPos);
          }
        });
      }
    }

         // 1. Cleared
    if (!formatted.trim()) {
      setLocalError(null);
      onChange?.(null);
      onChangeString?.("");
      onValidationError?.(null);
      return;
    }

    // 2. Complete date with 4-digit year (e.g. MM/DD/YYYY or M/D/YYYY)
    const isComplete = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(formatted.trim());
    if (isComplete) {
      const validation = validateDateString(formatted, {
        isDob,
        label,
        minDate,
        maxDate,
        disabledDates,
      });

      if (validation.isValid && validation.date) {
        setLocalError(null);
        setCalendarMonth(validation.date);
        onChange?.(validation.date);
        onChangeString?.(formatDateToYYYYMMDD(validation.date));
        onValidationError?.(null);
      } else {
        setLocalError(validation.error);
        onChange?.(null);
        onChangeString?.("");
        onValidationError?.(validation.error);
      }
    } else {
      // 3. Typing in progress:
      // Clear local error while typing so user is not interrupted,
      // and do NOT pass an invalid Date to form state.
      setLocalError(null);
      onChange?.(null);
      onChangeString?.("");
      onValidationError?.(null);
    }
  };

  const handleInputFocus = () => {
    isFocusedRef.current = true;
  };

  const handleInputBlur = () => {
    isFocusedRef.current = false;
    onBlur?.();

    const trimmed = textValue.trim();
    if (!trimmed) {
      setTextValue("");
      setLocalError(null);
      onChange?.(null);
      onChangeString?.("");
      onValidationError?.(null);
      return;
    }

    const isComplete = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed);
    if (!isComplete) {
      const errMsg = "Please enter a complete date (MM/DD/YYYY).";
      setLocalError(errMsg);
      onChange?.(null);
      onChangeString?.("");
      onValidationError?.(errMsg);
      return;
    }

    const validation = validateDateString(trimmed, {
      isDob,
      label,
      minDate,
      maxDate,
      disabledDates,
    });

    if (validation.isValid && validation.date) {
      const normalized = formatDateToMMDDYYYY(validation.date);
      setTextValue(normalized);
      setLocalError(null);
      setCalendarMonth(validation.date);
      onChange?.(validation.date);
      onChangeString?.(formatDateToYYYYMMDD(validation.date));
      onValidationError?.(null);
    } else {
      setLocalError(validation.error);
      onChange?.(null);
      onChangeString?.("");
      onValidationError?.(validation.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = textValue.trim();
      if (trimmed) {
        const validation = validateDateString(trimmed, {
          isDob,
          label,
          minDate,
          maxDate,
          disabledDates,
        });

        if (!validation.isValid) {
          e.preventDefault();
          setLocalError(validation.error);
          onValidationError?.(validation.error);
        } else if (validation.date) {
          const normalized = formatDateToMMDDYYYY(validation.date);
          setTextValue(normalized);
          setLocalError(null);
          setCalendarMonth(validation.date);
          onChange?.(validation.date);
          onChangeString?.(formatDateToYYYYMMDD(validation.date));
          onValidationError?.(null);
        }
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const safe = createSafeLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const formatted = formatDateToMMDDYYYY(safe);
      setTextValue(formatted);
      setLocalError(null);
      setCalendarMonth(safe);
      onChange?.(safe);
      onChangeString?.(formatDateToYYYYMMDD(safe));
      onValidationError?.(null);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTextValue("");
    setLocalError(null);
    onChange?.(null);
    onChangeString?.("");
    onValidationError?.(null);
  };

  // Month navigation bounds
  const effectiveStartMonth = startMonth || (isDob ? new Date(1920, 0, 1) : new Date(1950, 0, 1));
  const effectiveEndMonth = endMonth || (isDob ? new Date() : new Date(2050, 11, 31));

  const isDateDisabled = (day: Date) => {
    if (isDob) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (day > today) return true;
    }
    if (maxDate && day > maxDate) return true;
    if (minDate && day < minDate) return true;
    if (disabledDates && disabledDates(day)) return true;
    return false;
  };

  return (
    <div className={cn("flex flex-col gap-1 w-full", containerClassName)}>
      <div className="relative w-full flex items-center">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          value={textValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            "h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] px-3.5 pr-16 font-sans focus-visible:ring-1 focus-visible:ring-[#6887A0]",
            effectiveError && "ring-1 ring-[#FF3E46]",
            className
          )}
        />

        <div className="absolute right-2 flex items-center gap-0.5">
          {textValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#919191] hover:text-white transition-colors cursor-pointer rounded-md focus:outline-none"
              aria-label="Clear date"
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setIsOpen((prev) => !prev)}
                  aria-label="Open calendar"
                  className="p-1 text-[#919191] hover:text-white transition-colors cursor-pointer rounded-md focus:outline-none focus:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              }
            />
            <PopoverContent
              align="end"
              sideOffset={6}
              className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px] shadow-2xl z-50 overflow-hidden"
            >
              <Calendar
                mode="single"
                selected={parsedPropDate || undefined}
                onSelect={handleCalendarSelect}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                captionLayout="dropdown"
                startMonth={effectiveStartMonth}
                endMonth={effectiveEndMonth}
                disabled={isDateDisabled}
                className="p-3 bg-[#141C24] text-white [color-scheme:dark]"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {showErrorText && effectiveError && (
        <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
          {effectiveError}
        </p>
      )}
    </div>
  );
}

export default DatePickerInput;
