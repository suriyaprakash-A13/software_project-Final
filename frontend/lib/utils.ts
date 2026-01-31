import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    FOOD: 'bg-orange-100 text-orange-800',
    TRANSPORTATION: 'bg-blue-100 text-blue-800',
    ACCOMMODATION: 'bg-purple-100 text-purple-800',
    ENTERTAINMENT: 'bg-pink-100 text-pink-800',
    UTILITIES: 'bg-green-100 text-green-800',
    SHOPPING: 'bg-yellow-100 text-yellow-800',
    HEALTHCARE: 'bg-red-100 text-red-800',
    EDUCATION: 'bg-indigo-100 text-indigo-800',
    OTHER: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.OTHER;
}

export function getCategoryLabel(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
