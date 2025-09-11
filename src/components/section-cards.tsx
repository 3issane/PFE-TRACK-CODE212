import { IconListDetails, IconReport, IconUsers, IconCalendar } from "@tabler/icons-react"
import type { ComponentType } from "react"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type SectionCardsProps = {
  usersCount?:
    | number
    | {
        total: number
        admins: number
        students: number
        professors: number
      }
  reportsCount?: number
  topicsCount?: number
  schedulesCount?: number
  firstOverride?: {
    label: string
    value: number | string
    hint?: string
    Icon?: ComponentType<{ className?: string }>
  }
}

export function SectionCards({
  usersCount = 0,
  reportsCount = 0,
  topicsCount = 0,
  schedulesCount = 0,
  firstOverride,
}: SectionCardsProps) {
  const Stat = ({
    label,
    value,
    Icon,
    hint,
  }: {
    label: string
    value: number | string
    Icon: ComponentType<{ className?: string }>
    hint?: string
  }) => (
    <Card className="@container/card">
      <CardHeader>
  <CardDescription className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" /> {label}
        </CardDescription>
  <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        {hint}
      </CardFooter>
    </Card>
  )

  const usersCardValue = typeof usersCount === "number" ? usersCount : usersCount.total
  const usersLabel = firstOverride?.label || (typeof usersCount === "number" ? "My Students" : "Total Users")
  const usersHint = firstOverride?.hint || (
    typeof usersCount === "number"
      ? "Students you supervise"
      : `${usersCount.admins} admins, ${usersCount.students} students, ${usersCount.professors} professors`
  )
  const usersValue: number | string = firstOverride?.value ?? usersCardValue
  const UsersIcon = firstOverride?.Icon || IconUsers

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-4">
  <Stat label={usersLabel} value={usersValue} Icon={UsersIcon} hint={usersHint} />
      <Stat
        label="Uploaded Reports"
        value={reportsCount}
        Icon={IconReport}
        hint="Reports uploaded to date"
      />
      <Stat label="Total Topics" value={topicsCount} Icon={IconListDetails} hint="All topics available" />
  <Stat label="Total Schedules" value={schedulesCount} Icon={IconCalendar} hint="All schedule entries" />
    </div>
  )
}
