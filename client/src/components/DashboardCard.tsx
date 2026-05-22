type DashboardCardProps = {
  title: string;
  value: string;
};

function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
}

export default DashboardCard;