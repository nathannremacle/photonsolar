"use client";

import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export default function DatePicker({
  value,
  onChange,
  label = "Date",
}: DatePickerProps) {
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // Try to parse the date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's not a valid date, try to parse French format
      const parts = dateString.split(' ');
      if (parts.length >= 3) {
        const day = parts[0];
        const monthMap: Record<string, string> = {
          'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
          'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
          'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
        };
        const month = monthMap[parts[1]?.toLowerCase()] || '01';
        const year = parts[2] || new Date().getFullYear().toString();
        return `${year}-${month}-${day.padStart(2, '0')}`;
      }
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if not a valid date
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      const formatted = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      onChange(formatted);
    } else {
      onChange('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      {value && (
        <p className="mt-1 text-xs text-gray-500">
          Format affiché : {formatDateForDisplay(value)}
        </p>
      )}
    </div>
  );
}

