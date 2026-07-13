import "./Heatmap.css";


type HeatmapLevel = "level-0" | "level-1" | "level-2" | "level-3" | "level-4";


interface HeatmapDay {
  date: Date;
  count: number | null; // null = no data for this cell (padding)
}

interface HeatmapProps {
 
  activity: number[];


  startDate?: Date | string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]; // GitHub shows only these 3



const getLevel = (count: number): HeatmapLevel => {
  if (count === 0) return "level-0";
  if (count <= 2) return "level-1";
  if (count <= 5) return "level-2";
  if (count <= 8) return "level-3";
  return "level-4";
};

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};


function buildCalendarDays(activity: number[], startDate?: Date | string): HeatmapDay[] {
  const firstDataDate = startDate
    ? startOfDay(new Date(startDate))
    : startOfDay(new Date(Date.now() - (activity.length - 1) * DAY_MS));

  const lastDataDate = new Date(firstDataDate.getTime() + (activity.length - 1) * DAY_MS);

  
  const gridStart = new Date(firstDataDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

 
  const gridEnd = new Date(lastDataDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days: HeatmapDay[] = [];
  for (let t = gridStart.getTime(); t <= gridEnd.getTime(); t += DAY_MS) {
    const date = new Date(t);
    const dayIndex = Math.round((date.getTime() - firstDataDate.getTime()) / DAY_MS);
    const isWithinData = dayIndex >= 0 && dayIndex < activity.length;
    days.push({ date, count: isWithinData ? activity[dayIndex] : null });
  }
  return days;
}


function chunkIntoWeeks(days: HeatmapDay[]): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Heatmap({ activity, startDate }: HeatmapProps) {
  const days = buildCalendarDays(activity, startDate);
  const weeks = chunkIntoWeeks(days);

  
  let lastLabeledMonth = -1;
  const monthLabels = weeks.map((week) => {
    const firstDay = week[0].date;
    const month = firstDay.getMonth();
    if (month !== lastLabeledMonth) {
      lastLabeledMonth = month;
      return firstDay.toLocaleDateString(undefined, { month: "short" });
    }
    return "";
  });

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-scroll">
        {/* Month labels row, one per week column */}
        <div className="heatmap-months" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
          {monthLabels.map((label, i) => (
            <span key={i} className="heatmap-month-label">
              {label}
            </span>
          ))}
        </div>

        <div className="heatmap-body">
          {/* Weekday labels down the left side */}
          <div className="heatmap-weekdays">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="heatmap-weekday-label">
                {label}
              </span>
            ))}
          </div>

        
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div className="heatmap-week" key={weekIndex}>
                {week.map((day) => {
                
                  const hasData = day.count !== null;
                  const level = hasData ? getLevel(day.count as number) : null;

                  return (
                    <div
                      key={day.date.toISOString()}
                      className={`heatmap-cell ${level ?? "level-empty"}`}
                      role="img"
                      aria-label={
                        hasData
                          ? `${day.count} pilsa on ${formatDateLabel(day.date)}`
                          : `No data for ${formatDateLabel(day.date)}`
                      }
                      title={
                        hasData
                          ? `${day.count} pilsa · ${formatDateLabel(day.date)}`
                          : formatDateLabel(day.date)
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

     
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-cell level-0" />
        <div className="heatmap-cell level-1" />
        <div className="heatmap-cell level-2" />
        <div className="heatmap-cell level-3" />
        <div className="heatmap-cell level-4" />
        <span>More</span>
      </div>
    </div>
  );
}

export default Heatmap;
