export const Holidays = [
  { name: "New Year Day", date: new Date("2025-01-01") },
  { name: "Republic Day", date: new Date("2025-01-26") },
  { name: "Holi - 2nd day", date: new Date("2025-03-14") },
  { name: "Ramzan ID", date: new Date("2025-03-31") },
  { name: "Mahavir Jayanti", date: new Date("2025-04-10") },
  { name: "Labour Day", date: new Date("2025-05-01") },
  { name: "Independence Day", date: new Date("2025-08-15") },
  { name: "Ganesh Chaturthi", date: new Date("2025-08-27") },
  { name: "Gandhi Jayanti/Dussehra", date: new Date("2025-10-02") },
  { name: "Diwali", date: new Date("2025-10-20") },
  { name: "Diwali", date: new Date("2025-10-21") },
  { name: "Christmas", date: new Date("2025-12-25") },
];



export const isHoliday = (date: Date) => {
  const month = date.getMonth(); 
  const day = date.getDate();

  return Holidays.some(
    holiday => 
      holiday.date.getMonth() === month &&
      holiday.date.getDate() === day
  );
};
