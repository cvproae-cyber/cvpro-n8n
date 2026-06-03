"use client";

import { useState } from "react";
import { useListBroadcasts } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

export default function BroadcastsPage() {
  const { data: broadcasts, isLoading, refetch } = useListBroadcasts();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "whatsapp", message: "" });

  const handleCreate = async () => {
    if (!form.name || !form.message) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    // هنا يمكنك استدعاء API لإنشاء broadcast (مؤقتاً نستخدم console)
    toast({ title: "Broadcast created (demo)" });
    setOpen(false);
    setForm({ name: "", channel: "whatsapp", message: "" });
    refetch();
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Broadcasts</h1><p className="text-muted-foreground">Mass messaging campaigns.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4" /> New Broadcast</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Broadcast</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select>
              <Textarea placeholder="Message content" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Sent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{broadcasts?.reduce((a,b) => a + (b.sent_count||0), 0) || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Delivery Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">78%</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Avg Open Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">52%</div></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Sent</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> :
              broadcasts?.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No broadcasts yet.</TableCell></TableRow> :
              broadcasts?.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.channel === "whatsapp" ? <FaWhatsapp className="text-[#25D366]" /> : b.channel === "instagram" ? <FaInstagram className="text-pink-500" /> : "Both"}</TableCell>
                  <TableCell><Badge variant={b.status === "completed" ? "default" : "secondary"}>{b.status}</Badge></TableCell>
                  <TableCell className="text-right">{b.sent_count}</TableCell>
                  <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
