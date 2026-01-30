import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover"

interface DateTimePickerProps {
    date?: Date
    onDateChange: (date: Date | undefined) => void
    placeholder?: string
    minDate?: Date
}

export function DateTimePicker({
    date,
    onDateChange,
    placeholder = "Pick a date and time",
    minDate,
}: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
    const [hours, setHours] = React.useState<string>(
        date ? format(date, "HH") : "09"
    )
    const [minutes, setMinutes] = React.useState<string>(
        date ? format(date, "mm") : "00"
    )

    React.useEffect(() => {
        setSelectedDate(date)
        if (date) {
            setHours(format(date, "HH"))
            setMinutes(format(date, "mm"))
        }
    }, [date])

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate) {
            const updatedDate = new Date(newDate)
            updatedDate.setHours(parseInt(hours), parseInt(minutes))
            setSelectedDate(updatedDate)
            onDateChange(updatedDate)
        } else {
            setSelectedDate(undefined)
            onDateChange(undefined)
        }
    }

    const handleTimeChange = (newHours: string, newMinutes: string) => {
        setHours(newHours)
        setMinutes(newMinutes)

        if (selectedDate) {
            const updatedDate = new Date(selectedDate)
            updatedDate.setHours(parseInt(newHours), parseInt(newMinutes))
            setSelectedDate(updatedDate)
            onDateChange(updatedDate)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-gray-500"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                        format(selectedDate, "MM/dd/yyyy h:mm aa")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) =>
                        minDate ? date < minDate : false
                    }
                />
                <div className="border-t border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div className="flex items-center gap-1">
                            <select
                                value={hours}
                                onChange={(e) => handleTimeChange(e.target.value, minutes)}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, "0")
                                    return (
                                        <option key={hour} value={hour}>
                                            {hour}
                                        </option>
                                    )
                                })}
                            </select>
                            <span className="text-gray-500">:</span>
                            <select
                                value={minutes}
                                onChange={(e) => handleTimeChange(hours, e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Array.from({ length: 60 }, (_, i) => {
                                    const minute = i.toString().padStart(2, "0")
                                    return (
                                        <option key={minute} value={minute}>
                                            {minute}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
