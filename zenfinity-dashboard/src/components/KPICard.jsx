
const KPICard = ({ title, value, unit, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center backdrop-blur">
      <div className={`p-3 rounded-lg mr-4 ${colorClasses[color] || colorClasses.blue} dark:opacity-80`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
          {value} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{unit}</span>
        </h4>
      </div>
    </div>
  );
};

export default KPICard;