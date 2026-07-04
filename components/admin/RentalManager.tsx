'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createRentalBooking, returnRental, updateDepositStatus, cancelRentalBooking,
  type RentalRow, type RentalVehicleOption,
} from '@/lib/actions/rental.actions'
import { formatRupiah, formatDateShort, daysBetween } from '@/lib/utils'

interface Props {
  rentals: RentalRow[]
  vehicles: RentalVehicleOption[]
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50'
const primaryStyle = { background: 'linear-gradient(135deg, #1A56DB, #3b82f6)' }

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Menunggu Bayar', paid: 'Dibayar', confirmed: 'Aktif',
  otw_pickup: 'Jemput', on_trip: 'Berjalan', almost_arrived: 'Hampir Selesai',
  completed: 'Selesai', cancelled: 'Batal', expired: 'Kedaluwarsa',
}
const DEPOSIT_LABEL: Record<string, string> = { held: 'Ditahan', returned: 'Dikembalikan', deducted: 'Dipotong' }
const LATE_LABEL: Record<string, string> = { pending: 'Menunggu', waived: 'Dibebaskan', collected: 'Ditagih' }

function statusColor(s: string): string {
  if (s === 'completed') return 'bg-emerald-50 text-emerald-700'
  if (s === 'cancelled' || s === 'expired') return 'bg-slate-100 text-slate-500'
  return 'bg-blue-50 text-blue-700'
}

export default function RentalManager({ rentals, vehicles }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [returnFor, setReturnFor] = useState<RentalRow | null>(null)

  const notify = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const run = (fn: () => Promise<{ success?: true; error?: string }>, okMsg: string, after?: () => void) =>
    startTransition(async () => {
      const res = await fn()
      if (res.error) { notify(res.error, false); return }
      notify(okMsg, true)
      after?.()
      router.refresh()
    })

  // ── Create form state ──
  const [cVehicle, setCVehicle] = useState('')
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cStart, setCStart] = useState('')
  const [cEnd, setCEnd] = useState('')
  const [cRate, setCRate] = useState('')
  const [cDeposit, setCDeposit] = useState('')
  const [cNotes, setCNotes] = useState('')

  const resetCreate = () => {
    setCVehicle(''); setCName(''); setCPhone(''); setCStart(''); setCEnd(''); setCRate(''); setCDeposit(''); setCNotes('')
  }

  const onPickVehicle = (id: string) => {
    setCVehicle(id)
    const v = vehicles.find((x) => x.id === id)
    if (v && v.pricePerDay > 0 && !cRate) setCRate(String(v.pricePerDay))
  }

  const cDays = useMemo(() => (cStart && cEnd && cEnd >= cStart ? Math.max(1, daysBetween(cStart, cEnd)) : 0), [cStart, cEnd])
  const cTotal = cDays * (Number(cRate) || 0)

  const submitCreate = () =>
    run(
      () => createRentalBooking({
        vehicleId: cVehicle, renterName: cName, renterPhone: cPhone,
        startDate: cStart, endDate: cEnd, dailyRate: Number(cRate) || 0,
        depositAmount: cDeposit ? Number(cDeposit) : 0, notes: cNotes,
      }),
      'Sewa berhasil dibuat.',
      () => { setShowCreate(false); resetCreate() },
    )

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-end">
        <button className={btnPrimary} style={primaryStyle} onClick={() => setShowCreate(true)}>+ Buat Sewa Baru</button>
      </div>

      <div className="bg-white p-5" style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}>
        {rentals.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-sm">Belum ada sewa. Klik “Buat Sewa Baru”.</div>
        ) : (
          <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Kode / Penyewa</th>
                  <th className="py-3 pr-4">Unit</th>
                  <th className="py-3 pr-4">Periode</th>
                  <th className="py-3 pr-4 text-right">Total</th>
                  <th className="py-3 pr-4">Deposit</th>
                  <th className="py-3 pr-4">Denda</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map((r) => {
                  const done = r.status === 'completed' || r.status === 'cancelled'
                  return (
                    <tr key={r.bookingId} className="hover:bg-slate-50/50 align-top">
                      <td className="py-3.5 pr-4">
                        <div className="font-mono text-xs text-slate-400">{r.bookingCode}</div>
                        <div className="font-bold text-slate-900">{r.renterName ?? '—'}</div>
                        <div className="text-xs text-slate-500">{r.renterPhone ?? ''}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-700">
                        <div>{r.vehicleLabel}</div>
                        <div className="text-xs text-slate-400">{r.plate}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">
                        {r.startDate ? formatDateShort(r.startDate) : '—'}<br />
                        <span className="text-slate-400">s/d</span> {r.endDate ? formatDateShort(r.endDate) : '—'}
                        {r.actualReturnDate && <div className="mt-0.5 text-xs text-slate-400">Kembali: {formatDateShort(r.actualReturnDate)}</div>}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-semibold tabular-nums text-slate-900">{formatRupiah(r.total)}</td>
                      <td className="py-3.5 pr-4">
                        <div className="tabular-nums text-slate-700">{formatRupiah(r.depositAmount)}</div>
                        {r.detailId && (
                          <select
                            value={r.depositStatus ?? 'held'}
                            disabled={pending}
                            onChange={(e) => run(() => updateDepositStatus(r.detailId!, r.bookingId, e.target.value as any), 'Status deposit diperbarui.')}
                            className="mt-1 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 disabled:opacity-50"
                            aria-label="Status deposit"
                          >
                            <option value="held">Ditahan</option>
                            <option value="returned">Dikembalikan</option>
                            <option value="deducted">Dipotong</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        {r.lateFeeAmount > 0
                          ? <><div className="tabular-nums text-red-600">{formatRupiah(r.lateFeeAmount)}</div><div className="text-xs text-slate-400">{LATE_LABEL[r.lateFeeStatus ?? 'pending']}</div></>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex flex-wrap items-center gap-1">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(r.status)}`}>
                            {STATUS_LABEL[r.status] ?? r.status}
                          </span>
                          {r.source === 'web' && (
                            <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Web</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col items-end gap-1">
                          {!done && r.detailId && (
                            <button onClick={() => setReturnFor(r)} disabled={pending} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50">Kembalikan</button>
                          )}
                          {!done && (
                            <button
                              onClick={() => { if (confirm(`Batalkan sewa ${r.bookingCode}?`)) run(() => cancelRentalBooking(r.bookingId), 'Sewa dibatalkan.') }}
                              disabled={pending}
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >Batal</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {rentals.map((r) => {
              const done = r.status === 'completed' || r.status === 'cancelled'
              return (
                <div key={r.bookingId} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-slate-400">{r.bookingCode}</div>
                      <div className="font-bold text-slate-900">{r.renterName ?? '—'}</div>
                      {r.renterPhone && <div className="text-xs text-slate-500">{r.renterPhone}</div>}
                    </div>
                    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(r.status)}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                      {r.source === 'web' && (
                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Web</span>
                      )}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Unit</span>
                      <span className="text-right text-sm text-slate-800">
                        {r.vehicleLabel}
                        {r.plate && <span className="block text-xs text-slate-400">{r.plate}</span>}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Periode</span>
                      <span className="text-right text-sm text-slate-800">
                        {r.startDate ? formatDateShort(r.startDate) : '—'} <span className="text-slate-400">s/d</span> {r.endDate ? formatDateShort(r.endDate) : '—'}
                        {r.actualReturnDate && <span className="block text-xs text-slate-400">Kembali: {formatDateShort(r.actualReturnDate)}</span>}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Total</span>
                      <span className="text-right text-sm font-semibold tabular-nums text-slate-900">{formatRupiah(r.total)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Deposit</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm tabular-nums text-slate-800">{formatRupiah(r.depositAmount)}</span>
                        {r.detailId && (
                          <select
                            value={r.depositStatus ?? 'held'}
                            disabled={pending}
                            onChange={(e) => run(() => updateDepositStatus(r.detailId!, r.bookingId, e.target.value as any), 'Status deposit diperbarui.')}
                            className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 disabled:opacity-50"
                            aria-label="Status deposit"
                          >
                            <option value="held">Ditahan</option>
                            <option value="returned">Dikembalikan</option>
                            <option value="deducted">Dipotong</option>
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Denda</span>
                      <span className="text-right text-sm">
                        {r.lateFeeAmount > 0
                          ? <><span className="tabular-nums text-red-600">{formatRupiah(r.lateFeeAmount)}</span><span className="block text-xs text-slate-400">{LATE_LABEL[r.lateFeeStatus ?? 'pending']}</span></>
                          : <span className="text-slate-300">—</span>}
                      </span>
                    </div>
                  </div>

                  {!done && (
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      {r.detailId && (
                        <button
                          onClick={() => setReturnFor(r)}
                          disabled={pending}
                          className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >Kembalikan</button>
                      )}
                      <button
                        onClick={() => { if (confirm(`Batalkan sewa ${r.bookingCode}?`)) run(() => cancelRentalBooking(r.bookingId), 'Sewa dibatalkan.') }}
                        disabled={pending}
                        className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >Batal</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={() => !pending && setShowCreate(false)}>
          <div className="w-full max-w-lg rounded-[20px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-slate-900">Buat Sewa Baru</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="r-veh" className="mb-1 block text-xs font-semibold text-slate-500">Kendaraan *</label>
                <select id="r-veh" value={cVehicle} onChange={(e) => onPickVehicle(e.target.value)} className={inputCls}>
                  <option value="">— Pilih unit —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}{v.pricePerDay > 0 ? ` (${formatRupiah(v.pricePerDay)}/hari)` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-name" className="mb-1 block text-xs font-semibold text-slate-500">Nama Penyewa *</label>
                  <input id="r-name" value={cName} onChange={(e) => setCName(e.target.value)} className={inputCls} placeholder="Nama" />
                </div>
                <div>
                  <label htmlFor="r-phone" className="mb-1 block text-xs font-semibold text-slate-500">No. Telepon *</label>
                  <input id="r-phone" value={cPhone} onChange={(e) => setCPhone(e.target.value)} className={inputCls} placeholder="0812..." inputMode="tel" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-start" className="mb-1 block text-xs font-semibold text-slate-500">Mulai *</label>
                  <input id="r-start" type="date" value={cStart} onChange={(e) => setCStart(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="r-end" className="mb-1 block text-xs font-semibold text-slate-500">Selesai *</label>
                  <input id="r-end" type="date" value={cEnd} onChange={(e) => setCEnd(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-rate" className="mb-1 block text-xs font-semibold text-slate-500">Tarif / Hari *</label>
                  <input id="r-rate" type="number" min={0} value={cRate} onChange={(e) => setCRate(e.target.value)} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label htmlFor="r-dep" className="mb-1 block text-xs font-semibold text-slate-500">Deposit / Jaminan</label>
                  <input id="r-dep" type="number" min={0} value={cDeposit} onChange={(e) => setCDeposit(e.target.value)} className={inputCls} placeholder="0" />
                </div>
              </div>
              <div>
                <label htmlFor="r-notes" className="mb-1 block text-xs font-semibold text-slate-500">Catatan</label>
                <input id="r-notes" value={cNotes} onChange={(e) => setCNotes(e.target.value)} className={inputCls} placeholder="opsional" />
              </div>
              {cDays > 0 && (Number(cRate) || 0) > 0 && (
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  {cDays} hari × {formatRupiah(Number(cRate) || 0)} = <span className="font-bold text-slate-900">{formatRupiah(cTotal)}</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={submitCreate} disabled={pending || !cVehicle || !cName.trim() || !cPhone.trim() || cDays <= 0 || !(Number(cRate) > 0)} className={btnPrimary} style={primaryStyle}>Simpan Sewa</button>
            </div>
          </div>
        </div>
      )}

      {returnFor && <ReturnModal rental={returnFor} pending={pending} onClose={() => setReturnFor(null)} onSubmit={(payload) => run(() => returnRental(payload), 'Pengembalian tersimpan.', () => setReturnFor(null))} />}
    </div>
  )
}

// ── Return / late-fee modal ──
function ReturnModal({
  rental, pending, onClose, onSubmit,
}: {
  rental: RentalRow
  pending: boolean
  onClose: () => void
  onSubmit: (payload: {
    bookingId: string; detailId: string; actualReturnDate: string
    lateFeeAmount: number; lateFeeStatus: 'pending' | 'waived' | 'collected'
    depositStatus: 'held' | 'returned' | 'deducted'; notes?: string
  }) => void
}) {
  const [actual, setActual] = useState(rental.endDate ?? '')
  const daysLate = useMemo(
    () => (rental.endDate && actual && actual > rental.endDate ? Math.max(0, daysBetween(rental.endDate, actual)) : 0),
    [rental.endDate, actual],
  )
  const suggested = daysLate * rental.dailyRate
  const [lateFee, setLateFee] = useState('')
  const [lateStatus, setLateStatus] = useState<'pending' | 'waived' | 'collected'>('pending')
  const [depositStatus, setDepositStatus] = useState<'held' | 'returned' | 'deducted'>(
    (rental.depositStatus as any) ?? 'held',
  )
  const [notes, setNotes] = useState(rental.notes ?? '')

  // Nilai denda efektif: pakai input admin bila diisi, else saran otomatis.
  const effectiveLateFee = lateFee !== '' ? Number(lateFee) || 0 : suggested

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={() => !pending && onClose()}>
      <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-bold text-slate-900">Proses Pengembalian</h3>
        <p className="mb-4 text-xs text-slate-500">{rental.vehicleLabel} · {rental.plate} · jatuh tempo {rental.endDate ? formatDateShort(rental.endDate) : '—'}</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="ret-date" className="mb-1 block text-xs font-semibold text-slate-500">Tanggal Kembali Aktual *</label>
            <input id="ret-date" type="date" value={actual} onChange={(e) => setActual(e.target.value)} className={inputCls} />
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            {daysLate > 0
              ? <>Telat <span className="font-bold text-red-600">{daysLate} hari</span> × {formatRupiah(rental.dailyRate)} = saran denda <span className="font-bold text-slate-900">{formatRupiah(suggested)}</span></>
              : <span className="text-emerald-700">Tidak terlambat — tanpa denda.</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ret-fee" className="mb-1 block text-xs font-semibold text-slate-500">Denda (override)</label>
              <input id="ret-fee" type="number" min={0} value={lateFee} onChange={(e) => setLateFee(e.target.value)} className={inputCls} placeholder={String(suggested)} />
            </div>
            <div>
              <label htmlFor="ret-fee-st" className="mb-1 block text-xs font-semibold text-slate-500">Status Denda</label>
              <select id="ret-fee-st" value={lateStatus} onChange={(e) => setLateStatus(e.target.value as any)} className={inputCls}>
                <option value="pending">Menunggu</option>
                <option value="collected">Ditagih</option>
                <option value="waived">Dibebaskan</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ret-dep" className="mb-1 block text-xs font-semibold text-slate-500">Status Deposit</label>
            <select id="ret-dep" value={depositStatus} onChange={(e) => setDepositStatus(e.target.value as any)} className={inputCls}>
              <option value="held">Ditahan</option>
              <option value="returned">Dikembalikan</option>
              <option value="deducted">Dipotong (untuk denda/kerusakan)</option>
            </select>
          </div>
          <div>
            <label htmlFor="ret-notes" className="mb-1 block text-xs font-semibold text-slate-500">Catatan</label>
            <input id="ret-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="mis. kondisi unit, alasan potong deposit" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
          <button
            onClick={() => onSubmit({
              bookingId: rental.bookingId, detailId: rental.detailId!, actualReturnDate: actual,
              lateFeeAmount: effectiveLateFee, lateFeeStatus: lateStatus, depositStatus, notes,
            })}
            disabled={pending || !actual}
            className={btnPrimary}
            style={primaryStyle}
          >Selesaikan</button>
        </div>
      </div>
    </div>
  )
}
