// /netlify/functions/generate-ics.js
// Generates a .ics calendar file for session bookings
// Called via: /.netlify/functions/generate-ics?date=2026-03-27&start=10:00&end=11:00&name=Todd&zoom=https://...

exports.handler = async (event) => {
  const { date, start, end, name, zoom } = event.queryStringParameters || {};

  if (!date || !start) {
    return { statusCode: 400, body: "Missing required params: date, start" };
  }

  // Build datetime strings in iCal format: 20260327T100000
  function toIcalDate(dateStr, timeStr) {
    const d = dateStr.replace(/-/g, "");
    const t = (timeStr || "000000").replace(/:/g, "").padEnd(6, "0").slice(0, 6);
    return d + "T" + t;
  }

  // Calculate end time if not provided (default +60 min)
  function addMinutes(timeStr, mins) {
    const [h, m] = timeStr.split(":").map(Number);
    const total = h * 60 + m + mins;
    return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
  }

  const endTime = end || addMinutes(start, 60);
  const dtStart = toIcalDate(date, start);
  const dtEnd = toIcalDate(date, endTime);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `session-${date}-${start.replace(":", "")}@quantumphysician.com`;

  const clientName = name || "Client";
  const zoomLine = zoom ? `LOCATION:${zoom}\nDESCRIPTION:Join your session: ${zoom}` : "DESCRIPTION:1-on-1 Healing Session with Dr. Tracey Clark";

  // Add a 24-hour reminder alarm
  const alarm = `BEGIN:VALARM\r\nTRIGGER:-PT24H\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder: Your session with Dr. Tracey Clark is tomorrow\r\nEND:VALARM\r\nBEGIN:VALARM\r\nTRIGGER:-PT1H\r\nACTION:DISPLAY\r\nDESCRIPTION:Your session with Dr. Tracey Clark starts in 1 hour\r\nEND:VALARM`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Quantum Physician//Session Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Session with Dr. Tracey Clark`,
    zoomLine,
    `ORGANIZER;CN=Dr. Tracey Clark:mailto:tracey@quantumphysician.com`,
    `ATTENDEE;CN=${clientName}:mailto:${clientName}`,
    alarm,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="session-${date}.ics"`,
      "Cache-Control": "no-cache",
    },
    body: ics,
  };
};
