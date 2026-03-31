import { createFileRoute, useNavigate } from '@tanstack/react-router'
import LandingPage from '@/components/LandingPage'

export const Route = createFileRoute('/_public/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()

  return (
    <LandingPage
      onEnterAdmin={() => navigate({ to: '/admin' })}
      onEnterOfficer={() => navigate({ to: '/officer' })}
    />
  )
}
