"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPatients } from "@/lib/api";
import type { Patient } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RAGChat } from "@/components/RAGChat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Search,
  Filter,
  ChevronRight,
  Users,
  AlertTriangle,
  CheckCircle,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPhysician, setFilterPhysician] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  const physicians = [...new Set(patients.map((p) => p.attending_physician))];
  const units = [...new Set(patients.map((p) => p.room.split("-")[0]))];

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      p.room.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchPhysician = filterPhysician === "all" || p.attending_physician === filterPhysician;
    const matchUnit = filterUnit === "all" || p.room.startsWith(filterUnit);
    return matchSearch && matchStatus && matchPhysician && matchUnit;
  });

  const counts = {
    total: patients.length,
    critical: patients.filter((p) => p.status === "critical").length,
    warning: patients.filter((p) => p.status === "warning").length,
    stable: patients.filter((p) => p.status === "stable").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">CareIQ</h1>
            <p className="text-xs text-slate-500">Patient Monitoring Dashboard</p>
          </div>
        </div>
        <Link
          href="/architecture"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 rounded-lg px-3 py-1.5"
        >
          <Layers size={14} />
          RAG Architecture
        </Link>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left — Patient Table */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Users size={13} /> All Patients
              </div>
              <p className="text-3xl font-bold text-slate-800">{counts.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-2 text-red-500 text-xs mb-1">
                <AlertTriangle size={13} /> Critical
              </div>
              <p className="text-3xl font-bold text-red-600">{counts.critical}</p>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 text-amber-500 text-xs mb-1">
                <AlertTriangle size={13} /> Warning
              </div>
              <p className="text-3xl font-bold text-amber-600">{counts.warning}</p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-4">
              <div className="flex items-center gap-2 text-emerald-500 text-xs mb-1">
                <CheckCircle size={13} /> Stable
              </div>
              <p className="text-3xl font-bold text-emerald-600">{counts.stable}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 text-slate-500 text-xs">
              <Filter size={13} />
              <span className="font-medium">Filters</span>
              <span className="ml-auto text-slate-400 italic">
                How many filters does it take to find who needs attention?
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search patients, diagnosis, room..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="stable">Stable</option>
              </select>
              <select
                value={filterPhysician}
                onChange={(e) => setFilterPhysician(e.target.value)}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white"
              >
                <option value="all">All Physicians</option>
                {physicians.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white"
              >
                <option value="all">All Units</option>
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Patient Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Room</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Diagnosis</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Physician</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Admitted</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      Loading patients...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No patients match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        p.status === "critical" ? "bg-red-50/50" : ""
                      }`}
                    >
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="block">
                          <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.age}y · {p.gender}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="block">
                          <Badge variant="outline" className="text-xs font-mono">{p.room}</Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="block text-sm text-slate-700">
                          {p.diagnosis}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="block text-sm text-slate-600">
                          {p.attending_physician}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="block">
                          <StatusBadge status={p.status} />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="block text-sm text-slate-500">
                          {p.admission_date}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="text-slate-400 hover:text-blue-600">
                          <ChevronRight size={16} />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right — Global RAG Chat */}
        <div className="w-[420px] border-l border-slate-200 p-4 bg-white flex flex-col">
          <RAGChat globalMode />
        </div>
      </div>
    </div>
  );
}
