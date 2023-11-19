import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request): Promise<Response> {
    const SUPABASE_URL = "https://gcsephastazeujzenafd.supabase.co"
    const supabaseKey = process.env.SUPABASE_KEY || 'none'
    const supabase = createClient(SUPABASE_URL, supabaseKey);

    let { data: transactions, error } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false })

    if (error) {
        console.log(error)
        return Response.json({ error });
    }
    return Response.json({data: transactions})
}