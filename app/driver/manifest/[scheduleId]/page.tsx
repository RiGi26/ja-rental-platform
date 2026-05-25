interface Props {
  params: Promise<{ scheduleId: string }>
}

export default async function DriverManifestPage({ params }: Props) {
  const { scheduleId } = await params

  return (
    <div>
      <h1 className="text-xl font-display font-bold text-text mb-4">Manifest Penumpang</h1>
      <p className="text-text-muted text-sm mb-4">Jadwal ID: {scheduleId}</p>
      {/* TODO: list penumpang, scan QR, update status perjalanan */}
    </div>
  )
}
