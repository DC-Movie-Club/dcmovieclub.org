export type CalendarEvent = {
  id: string
  title: string
  description: string | null
  location: string | null
  start: string
  end: string
  allDay: boolean
  link: string | null
  tickets: EventTicket[]
}

export type EventTicket = {
  label: string
  url: string
}
