// Blacklist / Whitelist / Security Events admin tab
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, ShieldCheck, RefreshCw, AlertTriangle, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  listBlacklist, listWhitelist, listEvents,
  addBlacklist, removeBlacklist, addWhitelist, removeWhitelist, moveToWhitelist,
  type BlacklistEntry, type WhitelistEntry, type SecurityEvent,
} from "@/lib/security/blacklist";

export default function BlacklistTab() {
  const [bl, setBl] = useState<BlacklistEntry[]>([]);
  const [wl, setWl] = useState<WhitelistEntry[]>([]);
  const [ev, setEv] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBlIp, setNewBlIp] = useState("");
  const [newBlReason, setNewBlReason] = useState("Manual block");
  const [newWlIp, setNewWlIp] = useState("");
  const [newWlNote, setNewWlNote] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const [b, w, e] = await Promise.all([listBlacklist(), listWhitelist(), listEvents(100)]);
      setBl(b); setWl(w); setEv(e);
    } catch (err: any) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAddBl = async () => {
    if (!newBlIp.trim()) return;
    try {
      await addBlacklist(newBlIp.trim(), newBlReason || "Manual block");
      toast.success("IP blacklisted");
      setNewBlIp(""); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddWl = async () => {
    if (!newWlIp.trim()) return;
    try {
      await addWhitelist(newWlIp.trim(), newWlNote || undefined);
      toast.success("IP whitelisted");
      setNewWlIp(""); setNewWlNote(""); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveBl = async (id: string) => {
    try { await removeBlacklist(id); refresh(); toast.success("Removed from blacklist"); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveWl = async (id: string) => {
    try { await removeWhitelist(id); refresh(); toast.success("Removed from whitelist"); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleMove = async (entry: BlacklistEntry) => {
    try {
      await moveToWhitelist(entry);
      toast.success(`${entry.ip} moved to whitelist`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const sevBadge = (s: string) => {
    const map: any = { info: "secondary", low: "outline", medium: "default", high: "destructive", critical: "destructive" };
    return <Badge variant={map[s] || "outline"}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" /> IP Access Control
          </CardTitle>
          <CardDescription>
            Auto-blacklist activates after 5+ medium/high security events from the same IP in 10 minutes.
            Whitelisted IPs are never auto-blocked. Restore mistakenly blocked IPs with one click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3 text-sm">
              <Badge variant="destructive">{bl.length} blocked</Badge>
              <Badge variant="default" className="bg-green-600">{wl.length} trusted</Badge>
              <Badge variant="secondary">{ev.length} recent events</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <Tabs defaultValue="blacklist">
            <TabsList>
              <TabsTrigger value="blacklist"><Ban className="h-4 w-4 mr-2" />Blacklist</TabsTrigger>
              <TabsTrigger value="whitelist"><ShieldCheck className="h-4 w-4 mr-2" />Whitelist</TabsTrigger>
              <TabsTrigger value="events"><AlertTriangle className="h-4 w-4 mr-2" />Events</TabsTrigger>
            </TabsList>

            <TabsContent value="blacklist" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">IP address</Label>
                  <Input value={newBlIp} onChange={(e) => setNewBlIp(e.target.value)} placeholder="1.2.3.4" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reason</Label>
                  <Input value={newBlReason} onChange={(e) => setNewBlReason(e.target.value)} />
                </div>
                <Button onClick={handleAddBl}><Ban className="h-4 w-4 mr-2" />Block</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Blocked</TableHead>
                    <TableHead className="w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bl.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-sm">No blocked IPs</TableCell></TableRow>
                  )}
                  {bl.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.ip}</TableCell>
                      <TableCell className="text-xs">{b.reason}</TableCell>
                      <TableCell>{sevBadge(b.severity)}</TableCell>
                      <TableCell className="text-xs">{b.attempts}</TableCell>
                      <TableCell>
                        <Badge variant={b.auto ? "destructive" : "outline"}>{b.auto ? "auto" : "manual"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(b.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleMove(b)} title="Restore & whitelist">
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveBl(b.id)} title="Remove from blacklist">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="whitelist" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">IP address</Label>
                  <Input value={newWlIp} onChange={(e) => setNewWlIp(e.target.value)} placeholder="1.2.3.4" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Note (optional)</Label>
                  <Input value={newWlNote} onChange={(e) => setNewWlNote(e.target.value)} placeholder="Office IP" />
                </div>
                <Button onClick={handleAddWl}><ShieldCheck className="h-4 w-4 mr-2" />Trust</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wl.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm">No whitelisted IPs</TableCell></TableRow>
                  )}
                  {wl.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.ip}</TableCell>
                      <TableCell className="text-xs">{w.note || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveWl(w.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="events" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Route</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ev.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-sm">No events recorded</TableCell></TableRow>
                  )}
                  {ev.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{e.ip || "—"}</TableCell>
                      <TableCell className="text-xs">{e.event_type}</TableCell>
                      <TableCell>{sevBadge(e.severity)}</TableCell>
                      <TableCell className="font-mono text-xs">{e.route || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
