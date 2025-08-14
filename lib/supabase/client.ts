import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// 检查Supabase环境变量是否配置
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

if (!isSupabaseConfigured) {
  throw new Error('Supabase环境变量未正确配置。请检查 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 是否已设置。')
}

// 创建Supabase客户端实例
const supabaseClient = createClientComponentClient()

export const supabase = supabaseClient