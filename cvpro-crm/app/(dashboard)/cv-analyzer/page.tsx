"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, FileText } from "lucide-react";

export default function CVAnalyzerPage() {
  const [cvText, setCvText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!cvText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an ATS expert for UAE/Gulf market. Analyze this CV and return JSON with: score (0-100), strengths (array), weaknesses (array), sales_pitch (string), personalized_offer (string). CV: ${cvText.substring(0, 6000)}`
        })
      });
      const json = await res.json();
      const parsed = JSON.parse(json.text);
      setResult(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">AI CV Analyzer</h1>
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 text-primary" /> CV Content</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea placeholder="Paste CV text here..." className="flex-1 resize-none font-mono" value={cvText} onChange={(e) => setCvText(e.target.value)} />
            <Button onClick={handleAnalyze} disabled={analyzing || !cvText.trim()} className="w-full h-12"><Sparkles className="mr-2" /> {analyzing ? "Analyzing..." : "Analyze CV"}</Button>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-[500px] space-y-6">
        {!result ? (
          <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground">Paste a CV and click Analyze.</div>
        ) : (
          <>
            <Card>
              <CardHeader><CardTitle>Overall Score</CardTitle></CardHeader>
              <CardContent>
                <div className="text-6xl font-black text-primary">{result.score}</div>
                <Progress value={result.score} className="mt-4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>✅ Strengths</CardTitle></CardHeader>
              <CardContent><ul className="list-disc list-inside space-y-1">{result.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>⚠️ Weaknesses</CardTitle></CardHeader>
              <CardContent><ul className="list-disc list-inside space-y-1">{result.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader><CardTitle className="text-primary flex items-center gap-2"><Sparkles className="h-4" /> Sales Pitch</CardTitle></CardHeader>
              <CardContent>{result.sales_pitch}</CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
