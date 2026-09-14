import { NextResponse } from "next/server"
import { getStatistics } from "@/services/stats"

export const revalidate = 60

export const GET = async () => NextResponse.json({ statistics: await getStatistics() })
