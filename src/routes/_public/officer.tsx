import { createFileRoute } from '@tanstack/react-router'
import OfficerApp from '@/components/officer/OfficerApp'

export const Route = createFileRoute('/_public/officer')({
  component: OfficerPage,
})

function OfficerPage() {
  return <OfficerApp />
}
