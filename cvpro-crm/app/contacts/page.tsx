"use client";

import { useState } from "react";
import { useListContacts, useGetContactStats, useUpdateContact } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const { data: contacts, isLoading: contactsLoading, refetch } = useListContacts({ search: search || undefined, stage: stageFilter !== "all" ? stageFilter : undefined });
  const { data: stats, isLoading: statsLoading } = useGetContactStats();
  const { mutate: updateContact } = useUpdateContact();
  const { toast } = useToast();

  const handleStageChange = (id: string, newStage: string) => {
    updateContact({ id, data: { stage: newStage } }, {
      onSuccess: () => { toast({ title: "Stage updated" }); refetch(); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contacts & Pipeline</h1>
        <p className="text-muted-foreground">Manage leads and track conversions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Contacts</CardTitle></CardHeader>
          <CardContent>{statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.total || 0}</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle></CardHeader>
          <CardContent>{statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{((stats?.conversionRate || 0) * 100).toFixed(1)}%</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">New Today</CardTitle></CardHeader>
          <CardContent>{statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-primary">{stats?.newToday || 0}</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">New This Week</CardTitle></CardHeader>
          <CardContent>{statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-secondary">{stats?.newThisWeek || 0}</div>}</CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="cv_analyzed">CV Analyzed</SelectItem>
            <SelectItem value="offer_sent">Offer Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Add Contact</Button>
      </div>

      <Card>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Stage</TableHead><TableHead>Intent</TableHead><TableHead>Language</TableHead><TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactsLoading ? Array(5).fill(0).map((_, i) => <TableRow key={i}>{Array(6).fill(<TableCell><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>) :
                contacts?.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell></TableRow> :
                contacts?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium"><div>{c.full_name}</div><div className="text-xs text-muted-foreground">{c.phone_number}</div></TableCell>
                    <TableCell>{c.instagram_id ? <FaInstagram className="text-pink-500" /> : <FaWhatsapp className="text-[#25D366]" />}</TableCell>
                    <TableCell>
                      <Select value={c.lead_stage} onValueChange={(val) => handleStageChange(c.id, val)}>
                        <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="analysis_done">CV Analyzed</SelectItem>
                          <SelectItem value="offer_sent">Offer Sent</SelectItem><SelectItem value="negotiation">Negotiation</SelectItem><SelectItem value="won">Won</SelectItem><SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Badge variant={c.buying_intent_score > 70 ? "default" : "outline"}>{c.buying_intent_score}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="uppercase text-[10px]">{c.preferred_language}</Badge></TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}