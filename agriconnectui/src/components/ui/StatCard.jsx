export default function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="bg-[#f8f7f4] rounded-[8px] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-forest-400" />}
      </div>
      <p className="text-2xl font-semibold text-forest-900">{value}</p>
      {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
    </div>
  );
}
