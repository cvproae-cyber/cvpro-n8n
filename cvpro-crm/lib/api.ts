import { supabase } from "./supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ========== Types ==========
export interface Contact {
  id: string;
  full_name: string;
  phone_number?: string;
  instagram_id?: string;
  lead_stage: string;
  buying_intent_score: number;
  preferred_language: string;
  tags: string[];
  notes?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  channel: "whatsapp" | "instagram";
  status: string;
  human_takeover: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  content: string;
  is_ai_generated: boolean;
  created_at: string;
}

export interface Broadcast {
  id: string;
  name: string;
  channel: string;
  status: string;
  sent_count: number;
  delivered_count: number;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  content: string;
}

// ========== Supabase calls ==========
export async function fetchContacts(stage?: string, search?: string) {
  let query = supabase.from("customers").select("*");
  if (stage && stage !== "all") query = query.eq("lead_stage", stage);
  if (search) query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data as Contact[];
}

export async function fetchConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, customers(full_name, phone_number)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((conv: any) => ({
    id: conv.id,
    contactName: conv.customers?.full_name || "Unknown",
    contactPhone: conv.customers?.phone_number,
    channel: conv.channel,
    status: conv.status,
    aiEnabled: !conv.human_takeover,
    lastMessageAt: conv.updated_at,
    lastMessagePreview: "",
    unreadCount: 0,
  }));
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(conversationId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      direction: "outbound",
      content,
      sender_type: "agent",
      is_ai_generated: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConversationAI(id: string, aiEnabled: boolean) {
  const { error } = await supabase
    .from("conversations")
    .update({ human_takeover: !aiEnabled })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchBroadcasts() {
  const { data, error } = await supabase
    .from("broadcasts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Broadcast[];
}

export async function fetchTemplates() {
  const { data, error } = await supabase.from("templates").select("*");
  if (error) throw error;
  return data as Template[];
}

export async function fetchDashboardAnalytics() {
  const { count: totalContacts } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });
  const { count: totalConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true });
  const { data: revenueData } = await supabase
    .from("daily_analytics")
    .select("revenue_aed");
  const totalRevenue = revenueData?.reduce((acc, cur) => acc + (cur.revenue_aed || 0), 0) || 0;
  const conversionRate = 0.18;
  return { totalContacts: totalContacts || 0, totalConversations: totalConversations || 0, totalRevenue, conversionRate };
}

export async function fetchContactStats() {
  const { count: total } = await supabase.from("customers").select("*", { count: "exact", head: true });
  const today = new Date().toISOString().split("T")[0];
  const { count: newToday } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today);
  
  // New this week (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoISO = oneWeekAgo.toISOString();
  const { count: newThisWeek } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneWeekAgoISO);
  
  return { total: total || 0, newToday: newToday || 0, newThisWeek: newThisWeek || 0, conversionRate: 0.12 };
}

// ========== new functions ==========
export async function updateContact(id: string, data: { stage?: string; notes?: string }) {
  const updateData: any = {};
  if (data.stage !== undefined) updateData.lead_stage = data.stage;
  if (data.notes !== undefined) updateData.notes = data.notes;
  updateData.updated_at = new Date().toISOString();
  const { error } = await supabase.from("customers").update(updateData).eq("id", id);
  if (error) throw error;
}

export async function createBroadcast(data: { name: string; channel: string; message: string; templateId?: string }) {
  const { error } = await supabase.from("broadcasts").insert({
    name: data.name,
    channel: data.channel,
    status: "draft",
    template_name: data.templateId || null,
    audience_filter: { message: data.message },
  });
  if (error) throw error;
}

export async function createTemplate(data: { name: string; language: string; category: string; content: string; variables: string[] }) {
  const { error } = await supabase.from("templates").insert({
    name: data.name,
    language: data.language,
    category: data.category,
    content: data.content,
    variables: data.variables,
  });
  if (error) throw error;
}

// ========== React Query Hooks ==========
export function useListConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: fetchConversations });
}

export function useListMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content: string } }) => sendMessage(id, data.content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { aiEnabled: boolean } }) => updateConversationAI(id, data.aiEnabled),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
    },
  });
}

export function useListBroadcasts() {
  return useQuery({ queryKey: ["broadcasts"], queryFn: fetchBroadcasts });
}

export function useListTemplates() {
  return useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });
}

export function useGetDashboardAnalytics() {
  return useQuery({ queryKey: ["dashboard-analytics"], queryFn: fetchDashboardAnalytics });
}

export function useGetContactStats() {
  return useQuery({ queryKey: ["contact-stats"], queryFn: fetchContactStats });
}

export function useListContacts({ search, stage }: { search?: string; stage?: string }) {
  return useQuery({
    queryKey: ["contacts", search, stage],
    queryFn: () => fetchContacts(stage, search),
  });
}

export function useGetConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, customers(full_name, phone_number)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        contactName: data.customers?.full_name,
        channel: data.channel,
        status: data.status,
        aiEnabled: !data.human_takeover,
        contactId: data.customer_id,
      };
    },
    enabled: !!id,
  });
}

export function useGetContact(id: string) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
      if (error) throw error;
      return {
        name: data.full_name,
        phone: data.phone_number,
        stage: data.lead_stage,
        language: data.preferred_language,
        buyingIntentScore: data.buying_intent_score,
        tags: data.tags,
        notes: data.notes,
      };
    },
    enabled: !!id,
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { stage?: string; notes?: string } }) => updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
    },
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: { name: string; channel: string; message: string; templateId?: string } }) =>
      createBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: { name: string; language: string; category: string; content: string; variables: string[] } }) =>
      createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
