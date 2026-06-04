"use client";

import { useListTemplates } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Code2, Globe2, Tag } from "lucide-react";

export default function TemplatesPage() {
  const { data: templates, isLoading } = useListTemplates();

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div><h1 className="text-3xl font-bold tracking-tight">Message Templates</h1><p className="text-muted-foreground">Manage WhatsApp/Instagram templates.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? Array(6).fill(0).map((_,i) => <Skeleton key={i} className="h-[200px]" />) :
          templates?.map(t => (
            <Card key={t.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-mono text-primary flex items-center gap-2"><Code2 className="h-4" /> {t.name}</CardTitle>
                <CardDescription className="flex gap-2 mt-1"><Badge variant="outline"><Globe2 className="h-3 mr-1" /> {t.language}</Badge><Badge variant="secondary"><Tag className="h-3 mr-1" /> {t.category}</Badge></CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm bg-sidebar/50 p-3 rounded-md whitespace-pre-wrap font-mono" dir={t.language === "ar" ? "rtl" : "ltr"}>
                  {t.content.split(/(\{\{[^}]+\}\})/).map((part, i) =>
                    part.startsWith("{{") && part.endsWith("}}") ? <span key={i} className="text-secondary font-bold bg-secondary/10 px-1 rounded">{part}</span> : part
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}