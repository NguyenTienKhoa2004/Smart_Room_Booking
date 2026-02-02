import * as React from "react"
import { cn } from "../../lib/utils"

interface DateTimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max'> {
    date?: Date
    onDateChange: (date: Date | undefined) => void
    placeholder?: string
    minDate?: Date
}

export function DateTimePicker({
    date,
    onDateChange,
    placeholder,
    minDate,
    className,
    ...props
}: DateTimePickerProps) {

    // Helper to format Date to "YYYY-MM-DDTHH:mm" for input value
    const formatDateForInput = (d?: Date): string => {
        if (!d) return ""

        // Improve reliability by using local time components explicitly
        const pad = (num: number) => num.toString().padStart(2, '0')
        const year = d.getFullYear()
        const month = pad(d.getMonth() + 1)
        const day = pad(d.getDate())
        const hours = pad(d.getHours())
        const minutes = pad(d.getMinutes())

        return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (!value) {
            onDateChange(undefined)
            return
        }

        const newDate = new Date(value)
        if (!isNaN(newDate.getTime())) {
            onDateChange(newDate)
        }
    }

    return (
        <div className="relative w-full">
            <input
                type="datetime-local"
                value={formatDateForInput(date)}
                onChange={handleChange}
                min={minDate ? formatDateForInput(minDate) : undefined}
                className={cn(
                    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                    !date && "text-gray-500", // Dim text if empty/placeholder-like state
                    className
                )}
                {...props}
            />
        </div>
    )
}
