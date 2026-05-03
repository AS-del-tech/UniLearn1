import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  // Use anon key but pass the user's JWT as the auth header.
  // This authenticates all calls as that user without needing a service role key.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  // Verify the session is valid
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
  }

  // Call the delete_user() SQL function (SECURITY DEFINER, deletes auth.uid() only).
  // This function must exist in your Supabase project — see the migration file.
  const { error } = await supabase.rpc('delete_user');
  if (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete account. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
