import "./Heatmap.css";

interface HeatmapProps {
  activity: number[];
}

function Heatmap({ activity }: HeatmapProps) {
  // Decide the color level for each day
  const getLevel = (count: number) => {
    if (count === 0) return "level-0";
    if (count <= 2) return "level-1";
    if (count <= 5) return "level-2";
    if (count <= 8) return "level-3";
    return "level-4";
  };

  return (
    <div className="heatmap">
      {activity.map((count, index) => (
        <div
          key={index}
          className={`heatmap-cell ${getLevel(count)}`}
          title={`${count} activities`}
        />
      ))}
    </div>
  );
}

export default Heatmap;
