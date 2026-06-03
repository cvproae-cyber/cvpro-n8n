// cvpro-crm/lib/types.ts
export interface Customer {
  id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;           // ✅ DB column name
  instagram_id?: string;           // ✅ DB column name (not instagram_handle)
  channel?: string;
  lead_score?: number;
  lead_stage?: string;
  budget_estimate?: number;
  last_intent?: string;
  tags?: string[];
  cv_analysis?: any;
  created_at?: string;
  
  // 🔽 Missing fields that cause the current error
  buying_intent_score?: number;    // ← add this
  last_interaction?: string;       // ← add this (timestamp string)
  
  // Also good to include (used elsewhere)
  assigned_agent?: string;
  notes?: string;
  meta?: Record<string, any>;
  consent_given?: boolean;
  preferred_language?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  channel: string;
  status: string;
  human_takeover?: boolean;
  assigned_agent_id?: string;
  tags?: string[];
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  direction: "inbound" | "outbound";
  sender_type: "customer" | "agent" | "ai_agent";
  is_ai_generated?: boolean;
  channel?: string;
  created_at?: string;
}

export interface EnhancedCustomer extends Customer {
  conversation_id?: string;
  is_human_takeover?: boolean;
  last_message_preview?: string;
}
