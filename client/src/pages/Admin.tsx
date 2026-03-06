import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, TerminalSquare, Database, CheckCircle, BrainCircuit, Activity, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useConflicts } from "@/hooks/use-conflicts";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { data: conflicts } = useConflicts();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/conflicts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete conflict");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
            toast({ title: "MATRIX PURGED", description: "Data successfully formatted.", variant: "default" });
        },
        onError: (err: any) => {
            toast({ title: "PURGE FAILED", description: err.message, variant: "destructive" });
        }
    });

    const editMutation = useMutation({
        mutationFn: async ({ id, intensityScore }: { id: number, intensityScore: number }) => {
            const res = await fetch(`/api/admin/conflicts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intensityScore })
            });
            if (!res.ok) throw new Error("Failed to update intensity");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
            toast({ title: "MATRIX OVERRIDDEN", description: "Intensity score updated.", variant: "default" });
        },
        onError: (err: any) => {
            toast({ title: "OVERRIDE FAILED", description: err.message, variant: "destructive" });
        }
    });

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to completely purge '${name}' from Palantir Matrix?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (id: number, currentIntensity: number) => {
        const newScore = prompt(`Enter new intensity score (0-100) for conflict ID ${id}:`, currentIntensity.toString());
        if (newScore !== null) {
            const parsed = parseInt(newScore);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                editMutation.mutate({ id, intensityScore: parsed });
            } else {
                toast({ title: "INVALID INPUT", description: "Intensity must be an integer between 0 and 100.", variant: "destructive" });
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background text-foreground p-6 font-mono flex flex-col items-center justify-center">
                <div className="tactical-border bg-black/40 p-8 flex flex-col items-center max-w-md w-full">
                    <ShieldAlert className="w-12 h-12 text-destructive mb-6 shadow-neon" />
                    <h2 className="text-xl text-primary font-display font-bold mb-2 tracking-widest text-shadow-neon">RESTRICTED ACCESS</h2>
                    <p className="text-xs text-muted-foreground uppercase text-center mb-6">Enter Overseer Passcode to bypass security protocols.</p>

                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-black/60 border border-primary/20 text-primary p-3 mb-4 font-mono focus-visible:outline-none focus-visible:border-primary"
                        placeholder="[ENCRYPTED KEY]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && passwordInput === "shukla_techs@27") {
                                setIsAuthenticated(true);
                            } else if (e.key === 'Enter') {
                                toast({ title: "ACCESS DENIED", description: "Invalid passcode.", variant: "destructive" });
                            }
                        }}
                    />

                    <Button
                        onClick={() => {
                            if (passwordInput === "shukla_techs@27") setIsAuthenticated(true);
                            else toast({ title: "ACCESS DENIED", description: "Invalid passcode.", variant: "destructive" });
                        }}
                        className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50 tracking-widest font-bold"
                    >
                        AUTHORIZE
                    </Button>

                    <a href="/" className="mt-8 text-xs text-primary/70 hover:text-primary transition-colors hover:underline tracking-widest uppercase flex items-center gap-2">
                        ← RETURN TO DASHBOARD
                    </a>
                </div>
            </div>
        );
    }

    const handleParse = async () => {
        if (!inputText.trim()) {
            toast({
                title: "NO DATA PROVIDED",
                description: "Please paste intelligence data to parse.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch("/api/admin/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });

            if (!res.ok) throw new Error("API parsing failure.");

            const data = await res.json();

            // Invalidate the cache to instantly show it in the table below
            queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });

            toast({
                title: "INTELLIGENCE EXTRACTED",
                description: `Successfully assimilated matrix data for: ${data.name}.`,
                variant: "default"
            });
            setInputText("");
        } catch (err: any) {
            toast({
                title: "SYSTEM PARSE ERROR",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 font-mono selection:bg-primary/30 flex flex-col items-center">
            {/* HEADER */}
            <div className="w-full max-w-4xl border-b border-primary/20 pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary text-shadow-neon tracking-widest flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" /> OVERSEER COMMAND
                    </h1>
                    <p className="text-xs text-primary/70 tracking-[0.2em] mt-2 uppercase">Neural Data Assimilation Terminal</p>
                </div>
                <a href="/" className="text-xs text-primary/80 hover:text-primary transition-colors hover:underline tracking-widest">
                    RETURN TO DASHBOARD
                </a>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PARSE MODULE */}
                <div className="md:col-span-2 tactical-border bg-black/40 p-6 flex flex-col h-[500px]">
                    <div className="flex items-center gap-2 text-primary font-bold mb-4 uppercase text-sm tracking-widest border-b border-primary/20 pb-2">
                        <TerminalSquare className="w-4 h-4" /> Direct Intelligence Feed
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        Paste unstructured conflict reports, OSINT feeds, or tactical summaries below. The Heuristic Data Engine will auto-extract Belligerents, Casualties, Intensity Metrics, and Primary Sources to write directly into Palantir's remote database.
                    </p>

                    <Textarea
                        className="flex-1 bg-black/60 border-primary/20 font-mono text-primary/90 text-sm p-4 focus-visible:ring-1 focus-visible:ring-primary/50 resize-none shadow-inner"
                        placeholder="[AWAITING NEURAL INPUT STREAMS...]"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                    />

                    <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2 items-center text-[10px] text-muted-foreground tracking-widest uppercase">
                            <Activity className={`w-3 h-3 ${isProcessing ? 'text-orange-500 animate-spin' : 'text-primary'}`} />
                            {isProcessing ? 'ANALYZING THREAT FEED...' : 'SYSTEM IDLE'}
                        </div>
                        <Button
                            onClick={handleParse}
                            disabled={isProcessing}
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary/20 font-bold tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-black/80"
                        >
                            <BrainCircuit className="w-4 h-4 mr-2" />
                            {isProcessing ? 'EXECUTING...' : 'INITIATE ASSIMILATION'}
                        </Button>
                    </div>
                </div>

                {/* TERMINAL LOGS / STATUS */}
                <div className="tactical-border bg-black/40 p-6 flex flex-col">
                    <div className="flex items-center gap-2 text-primary font-bold mb-4 uppercase text-sm tracking-widest border-b border-primary/20 pb-2">
                        <Database className="w-4 h-4" /> Database Status
                    </div>
                    <div className="flex-1 flex flex-col gap-3 font-mono text-[10px]">
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-3 h-3" /> [SYS] STORAGE ........... ONLINE
                        </div>
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-3 h-3" /> [SYS] NEURAL NET ........ SECURE
                        </div>
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-3 h-3" /> [SYS] WRITE_LOCK ........ GRANTED
                        </div>

                        <div className="mt-8 pt-4 border-t border-primary/20 text-muted-foreground leading-relaxed">
                            <span className="text-primary font-bold">INFO:</span> The parsing engine is configured to identify numerical tokens, named nations, and casualty distributions automatically. Review the data in the main Palantir dashboard immediately after assimilation completes.
                        </div>
                    </div>
                </div>
            </div>

            {/* DATA MANAGEMENT MODULE */}
            <div className="w-full max-w-4xl mt-6 tactical-border bg-black/40 p-6 flex flex-col">
                <div className="flex items-center gap-2 text-primary font-bold mb-4 uppercase text-sm tracking-widest border-b border-primary/20 pb-2">
                    <Database className="w-4 h-4" /> Active Matrix Data Management
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm">
                        <thead className="text-xs text-muted-foreground uppercase border-b border-primary/20 bg-primary/5">
                            <tr>
                                <th className="p-3">Conflict Designation</th>
                                <th className="p-3">Intensity</th>
                                <th className="p-3 text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                            {conflicts?.map(conflict => (
                                <tr key={conflict.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-3 text-primary font-bold">{conflict.name}</td>
                                    <td className="p-3 text-destructive">{conflict.intensityScore}/100</td>
                                    <td className="p-3 flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 bg-black/50 border-primary/30 text-primary hover:bg-primary/20"
                                            onClick={() => handleEdit(conflict.id, conflict.intensityScore)}
                                            disabled={editMutation.isPending}
                                        >
                                            <Edit className="w-3 h-3 mr-2" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 bg-black/50 border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-red-400"
                                            onClick={() => handleDelete(conflict.id, conflict.name)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-3 h-3 mr-2" /> Format
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {!conflicts && (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-muted-foreground italic">
                                        [FETCHING MATRIX DATA...]
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
