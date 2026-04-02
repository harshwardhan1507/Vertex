export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-[#08080f] flex p-4 sm:p-8">
      <div className="m-auto w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}