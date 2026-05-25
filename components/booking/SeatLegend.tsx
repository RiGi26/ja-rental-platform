export default function SeatLegend() {
  return (
    <div className="flex items-center gap-5 mb-4 text-xs text-slate-500">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded bg-blue-50 border-2 border-blue-300" />
        <span>Tersedia</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded bg-blue-600 border-2 border-blue-700" />
        <span className="text-white bg-blue-600 px-1 rounded" style={{ fontSize: 11 }}>Dipilih</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded bg-gray-200 border-2 border-gray-300 opacity-60" />
        <span>Terisi</span>
      </div>
    </div>
  )
}
