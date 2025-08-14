"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// 登录操作
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "表单数据缺失" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "邮箱和密码为必填项" }
  }

  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Ignore cookie setting errors in server actions
        }
      },
    },
  })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("登录错误:", error)
    return { error: "发生意外错误，请重试" }
  }
}

// 注册操作
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "表单数据缺失" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "邮箱和密码为必填项" }
  }

  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Ignore cookie setting errors in server actions
        }
      },
    },
  })

  try {
    // 注册用户，禁用邮箱确认
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          email_confirm: false // 禁用邮箱确认
        }
      },
    })

    if (error) {
      return { error: error.message }
    }

    // 如果注册成功但需要邮箱确认，直接登录
    if (data.user && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toString(),
        password: password.toString(),
      })
      
      if (signInError) {
        return { error: signInError.message }
      }
    }

    return { success: "注册成功！正在为您登录..." }
  } catch (error) {
    console.error("注册错误:", error)
    return { error: "发生意外错误，请重试" }
  }
}

// 登出操作
export async function signOut() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Ignore cookie setting errors in server actions
        }
      },
    },
  })

  await supabase.auth.signOut()
  redirect("/auth/login")
}
