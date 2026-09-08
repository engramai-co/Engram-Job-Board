import { data, formatDate } from "../lib";

export function SearchCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay());
  const allEvents = [
    ...data.events.map((event) => ({ ...event, kind: event.kind || "Event" })),
    ...data.interviews.map((event) => ({ date: event.date, title: event.stage, kind: "Interview" }))
  ];
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { date, events: allEvents.filter((event) => event.date.slice(0, 10) === iso), outside: date.getMonth() !== month, today: date.toDateString() === today.toDateString() };
  });

  return (
    <section className="calendar-section" aria-labelledby="calendar-heading">
      <div className="section-heading calendar-heading"><div><h2 id="calendar-heading">Search calendar</h2><p>Interviews, application deadlines, and decision dates.</p></div><div className="calendar-month">{formatDate(first, { month: "long", year: "numeric" })}</div></div>
      <div className="calendar-grid" aria-label="Monthly search calendar">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
        {cells.map((cell) => <div className={`calendar-day${cell.outside ? " is-outside" : ""}${cell.today ? " is-today" : ""}`} key={cell.date.toISOString()}><span className="calendar-day__number">{cell.date.getDate()}</span>{cell.events.map((event) => <span className="calendar-event" title={`${event.kind}: ${event.title}`} key={`${event.date}-${event.title}`}>{event.title}</span>)}</div>)}
      </div>
    </section>
  );
}
