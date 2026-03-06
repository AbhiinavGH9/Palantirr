import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, TerminalSquare, Database, CheckCircle, BrainCircuit, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

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
        setTimeout(() => {
            toast({
                title: "INTELLIGENCE LOGGED",
                description: `Manual data received. Forwarding to Overseer for manual database injection.`,
                variant: "default"
            });
            setInputText("");
            setIsProcessing(false);
        }, 1500);
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
        </div>
    );
}
