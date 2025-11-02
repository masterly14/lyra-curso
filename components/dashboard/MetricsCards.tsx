"use client";

import useSWR from "swr";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MetricsCards() {
  const { data, isLoading } = useSWR("/api/metrics", fetcher, { refreshInterval: 60000 });

  if (isLoading || !data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardContent>
          <CardTitle>Total tareas</CardTitle>
          <p className="text-3xl font-bold mt-2">{data.total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Completadas</CardTitle>
          <p className="text-3xl font-bold mt-2">{data.completed}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Puntualidad</CardTitle>
          <p className="text-3xl font-bold mt-2">{data.punctuality}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
